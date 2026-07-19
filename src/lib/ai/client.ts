// The only module that talks to Gemini, and the only one that decides an AI call
// failed. Gemini is reached through the Generative Language API with an API key
// (process.env.GEMINI_API_KEY), so the app deploys anywhere that can hold an env
// var — no service account, no ADC, no Cloud project. Every call routes through
// generateJson/generateText, which guarantee a hard timeout, never throw (failure
// is a typed value), validate model output with Zod, and stay server-only.
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { GenerationConfig, GenerativeModel } from '@google/generative-ai';
import type { z } from 'zod';

import { AI_TIMEOUT_MS, GEMINI_MODEL, serverConfig } from '../config';
import { describeError, logger } from '../server/logger';

/**
 * Generation config for every call.
 *
 * `thinkingBudget: 0` disables the flash model's extended reasoning. Our tasks
 * are rephrasing computed facts into prose and translating/classifying an
 * incident — not multi-step reasoning — so thinking adds several seconds of
 * latency for no quality gain. Disabling it cut a real briefing from ~7.9s to
 * ~1.9s in testing, the difference between the AI path succeeding inside the
 * timeout and silently falling back to rule mode on every call.
 *
 * `thinkingConfig` is not in this SDK's `GenerationConfig` type, but the SDK
 * forwards generationConfig verbatim to the v1beta API, which honours it — hence
 * the assertion rather than a field the compiler already knows about.
 */
const GENERATION_CONFIG = {
  thinkingConfig: { thinkingBudget: 0 },
} as GenerationConfig;

/** Why an AI call did not produce usable output. */
export type AiFailureReason = 'not_configured' | 'timeout' | 'upstream_error' | 'invalid_output';

/** The result of an AI call. Failure is a value, never an exception. */
export type AiResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: AiFailureReason; detail: string };

let cachedClient: GoogleGenerativeAI | null = null;

/**
 * Returns a configured model, or null when no API key is set.
 *
 * A missing key is legitimate — every AI feature has a deterministic fallback,
 * so an unconfigured deploy degrades to rule mode rather than breaking. The
 * client is memoised because constructing it parses the key each time.
 */
function getModel(): GenerativeModel | null {
  const { GEMINI_API_KEY } = serverConfig();
  if (GEMINI_API_KEY === undefined || GEMINI_API_KEY.length === 0) return null;

  cachedClient ??= new GoogleGenerativeAI(GEMINI_API_KEY);
  return cachedClient.getGenerativeModel(
    { model: GEMINI_MODEL, generationConfig: GENERATION_CONFIG },
    // v1beta is the endpoint that honours thinkingConfig for the flash model.
    { apiVersion: 'v1beta' },
  );
}

/**
 * Removes the API key from a message before it is logged or returned.
 *
 * The SDK appends the key as a `?key=` query parameter, and a fetch error can
 * carry the request URL. Stripping it here keeps the never-leak guarantee that a
 * test pins, without depending on the SDK's error formatting staying constant.
 */
function redact(detail: string, apiKey: string | undefined): string {
  const noKeyParam = detail.replace(/([?&]key=)[^&\s]+/gi, '$1[redacted]');
  return apiKey ? noKeyParam.split(apiKey).join('[redacted]') : noKeyParam;
}

/**
 * Extracts a JSON object from a model response.
 *
 * Models wrap JSON in ```json fences or prose despite instructions not to, so
 * strip fences and fall back to the outermost brace-delimited span. This is
 * tolerance for known formatting habits, not for invented content — the result
 * still has to satisfy the caller's schema.
 */
export function extractJson(raw: string): string | null {
  // No \s* before the lazy capture: two variable-width matchers that both eat
  // whitespace force backtracking. The body is trimmed below regardless.
  const fenced = /```(?:json)?([\s\S]*?)```/i.exec(raw);
  const body = (fenced?.[1] ?? raw).trim();

  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  return body.slice(start, end + 1);
}

/** Calls Gemini and returns raw text. Never throws. */
export async function generateText(
  prompt: string,
  timeoutMs: number = AI_TIMEOUT_MS,
): Promise<AiResult<string>> {
  const model = getModel();
  if (model === null) {
    return { ok: false, reason: 'not_configured', detail: 'no Gemini API key configured' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const result = await model.generateContent(
      { contents: [{ role: 'user', parts: [{ text: prompt }] }] },
      { signal: controller.signal },
    );

    const text = result.response.text().trim();
    if (text.length === 0) {
      return { ok: false, reason: 'invalid_output', detail: 'model returned empty text' };
    }
    return { ok: true, value: text };
  } catch (error) {
    // Our own timer aborts the request on deadline; the SDK surfaces that as a
    // rejection, so an aborted signal is the ground truth for "timed out".
    const reason: AiFailureReason = controller.signal.aborted ? 'timeout' : 'upstream_error';
    const detail = redact(describeError(error), serverConfig().GEMINI_API_KEY);
    logger.warn('gemini call failed', { reason, detail });
    return { ok: false, reason, detail };
  } finally {
    clearTimeout(timer);
  }
}

/** Calls Gemini and validates the response against a schema. Never throws. */
export async function generateJson<T>(
  prompt: string,
  schema: z.ZodType<T>,
  timeoutMs: number = AI_TIMEOUT_MS,
): Promise<AiResult<T>> {
  const raw = await generateText(prompt, timeoutMs);
  if (!raw.ok) return raw;

  const json = extractJson(raw.value);
  if (json === null) {
    logger.warn('gemini returned no parseable JSON');
    return { ok: false, reason: 'invalid_output', detail: 'no JSON object in response' };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    logger.warn('gemini returned malformed JSON', { detail: describeError(error) });
    return { ok: false, reason: 'invalid_output', detail: 'malformed JSON' };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    // The model produced JSON of the wrong shape. Refusing it is the whole
    // point: downstream code is typed against the schema, not against hope.
    const detail = result.error.issues.map((i) => i.path.join('.')).join(', ');
    logger.warn('gemini output failed schema validation', { detail });
    return { ok: false, reason: 'invalid_output', detail: `schema mismatch: ${detail}` };
  }

  return { ok: true, value: result.data };
}

/** Resets the memoised client. Test-only seam. */
export function resetAiClient(): void {
  cachedClient = null;
}
