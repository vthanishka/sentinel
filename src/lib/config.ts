// The single validated gateway to process.env — no other module reads it. Zod
// parsing fails a misconfigured deploy at the boundary, not deep in a handler.
// serverConfig() throws in the browser, so leaking a secret into the client
// bundle becomes a build/runtime error rather than a silent security hole.
import { z } from 'zod';

/**
 * Gemini model id. Older flash ids (1.5-flash, and 2.5-flash for new API keys)
 * are gated and 404 with "no longer available"; gemini-3.5-flash is the current
 * fast model this key can call. A fast flash model is the right fit: the AI only
 * rephrases computed facts and translates incident text, not multi-step reasoning.
 */
export const GEMINI_MODEL = 'gemini-3.5-flash';

/**
 * Hard ceiling on a single Gemini call, in milliseconds.
 *
 * With extended thinking disabled (see `ai/client`), a real briefing or triage
 * returns in ~2s. This ceiling sits well above that so ordinary network
 * variance does not spuriously fall back to rule mode, while still bounding the
 * wait — the deterministic panels are instant regardless, and the AI briefing
 * only refreshes on a 20s cadence, so an 8s worst case is invisible in use.
 */
export const AI_TIMEOUT_MS = 8_000;

/**
 * AI requests permitted per authenticated user per minute.
 *
 * Sized for the dashboard's real shape, not a single endpoint. Three AI panels
 * (briefing, sustainability, recommendations) refresh on ~20–25s cadences —
 * roughly 9 calls/min at rest — and each re-fetches when the overall risk level
 * changes so the panels stay coherent with the live status during an escalation.
 * 30/min leaves comfortable headroom for that while still firmly capping abuse
 * of the Gemini budget; an earlier 15 throttled ordinary operation.
 */
export const AI_RATE_LIMIT_PER_MIN = 30;

const serverSchema = z.object({
  /**
   * API key for the Gemini Generative Language API. Absent in tests and in a
   * demo deploy, which is legitimate: every AI feature has a deterministic
   * fallback, so a missing key degrades the app to rule-based mode rather than
   * breaking it. Server-only — never prefixed NEXT_PUBLIC_, never in the bundle.
   */
  GEMINI_API_KEY: z.string().min(1).optional(),
  /**
   * The Firebase project id, used by the Admin SDK to verify ID tokens when
   * real auth is configured. Absent in demo mode (AUTH_BYPASS), which skips
   * token verification entirely, so the app runs with no Firebase project.
   */
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  /**
   * Explicit, opt-in bypass of token verification, for the E2E build only.
   *
   * The Playwright suite runs a *production* build (so it exercises the real CSP
   * and the real bundle), which means the non-production dev-auth path never
   * fires. Rather than weaken that production guard, the test harness sets this
   * flag to '1'. It is named for exactly what it is, defaults off, and is never
   * set by any real deployment — a test asserts that without it, production
   * refuses every request.
   */
  AUTH_BYPASS: z
    .enum(['0', '1'])
    .optional()
    .transform((value) => value === '1'),
});

const clientSchema = z.object({
  apiKey: z.string().min(1).optional(),
  authDomain: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
  storageBucket: z.string().min(1).optional(),
  messagingSenderId: z.string().min(1).optional(),
  appId: z.string().min(1).optional(),
});

export type ServerConfig = z.infer<typeof serverSchema>;

/** Firebase web-SDK config — safe to ship to the browser. */
export type ClientConfig = z.infer<typeof clientSchema>;

let cachedServer: ServerConfig | null = null;

export function serverConfig(): ServerConfig {
  if (typeof window !== 'undefined') {
    throw new Error('serverConfig() must never be called from the browser');
  }
  if (cachedServer === null) {
    cachedServer = serverSchema.parse({
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      FIREBASE_PROJECT_ID:
        process.env.FIREBASE_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NODE_ENV: process.env.NODE_ENV,
      AUTH_BYPASS: process.env.AUTH_BYPASS,
    });
  }
  return cachedServer;
}

// These values are public by design (Firebase security rests on Auth + rules, not
// on hiding the web API key). Each is a full literal `process.env.NEXT_PUBLIC_*`
// expression because Next.js inlines them at build time only when written this way.
export function clientConfig(): ClientConfig {
  return clientSchema.parse({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });
}

export function isFirebaseConfigured(): boolean {
  const c = clientConfig();
  return Boolean(c.apiKey && c.authDomain && c.projectId && c.appId);
}

// The Gemini API key is the one thing the AI path needs configured up front:
// with it, calls authenticate and bill against the key's project; without it,
// every AI feature degrades to deterministic rule mode.
export function isAiConfigured(): boolean {
  return Boolean(serverConfig().GEMINI_API_KEY);
}

/** Resets memoised config. Test-only seam for exercising env permutations. */
export function resetConfigCache(): void {
  cachedServer = null;
}
