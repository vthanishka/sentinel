/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { resetConfigCache } from '@/lib/config';

const constructedWith = vi.hoisted(() => vi.fn());
const getGenerativeModel = vi.hoisted(() => vi.fn());
const generateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    constructor(apiKey: string) {
      constructedWith(apiKey);
    }
    getGenerativeModel = getGenerativeModel;
  },
}));

const { extractJson, generateJson, generateText, resetAiClient } = await import('@/lib/ai/client');

/** Wraps text in the SDK's GenerateContentResult shape. */
function reply(text: string) {
  return { response: { text: () => text } };
}

beforeEach(() => {
  constructedWith.mockReset();
  generateContent.mockReset();
  getGenerativeModel.mockReset();
  getGenerativeModel.mockReturnValue({ generateContent });
  resetAiClient();
  resetConfigCache();
  process.env.GEMINI_API_KEY = 'test-key';
  resetConfigCache();
});

afterEach(() => {
  delete process.env.GEMINI_API_KEY;
  resetConfigCache();
  resetAiClient();
  vi.restoreAllMocks();
});

describe('extractJson', () => {
  it('reads a bare JSON object', () => {
    expect(extractJson('{"a":1}')).toBe('{"a":1}');
  });

  it('strips a ```json fence, which models add despite instructions', () => {
    expect(extractJson('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('strips an unlabelled fence', () => {
    expect(extractJson('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('finds JSON wrapped in chatty prose', () => {
    expect(extractJson('Sure! Here you go:\n{"a":1}\nHope that helps.')).toBe('{"a":1}');
  });

  it('keeps nested objects intact', () => {
    expect(extractJson('{"a":{"b":[1,2]}}')).toBe('{"a":{"b":[1,2]}}');
  });

  it('returns null when there is no object at all', () => {
    expect(extractJson('I cannot help with that.')).toBeNull();
    expect(extractJson('')).toBeNull();
  });

  it('returns null for an unclosed object', () => {
    expect(extractJson('{"a": 1')).toBeNull();
  });
});

describe('generateText', () => {
  it('returns model text on success', async () => {
    generateContent.mockResolvedValue(reply('  All clear.  '));
    await expect(generateText('p')).resolves.toEqual({ ok: true, value: 'All clear.' });
  });

  it('configures the pinned model with thinking disabled, using the API key', async () => {
    generateContent.mockResolvedValue(reply('ok'));
    await generateText('a prompt');

    expect(constructedWith).toHaveBeenCalledWith('test-key');
    const [modelParams] = getGenerativeModel.mock.calls[0] ?? [];
    expect(modelParams.model).toBe('gemini-3.5-flash');
    expect(modelParams.generationConfig.thinkingConfig.thinkingBudget).toBe(0);

    const [request] = generateContent.mock.calls[0] ?? [];
    expect(request.contents[0].parts[0].text).toBe('a prompt');
  });

  it('reports not_configured when no API key is set — rule mode, not a crash', async () => {
    delete process.env.GEMINI_API_KEY;
    resetConfigCache();

    const result = await generateText('p');
    expect(result).toMatchObject({ ok: false, reason: 'not_configured' });
    expect(generateContent).not.toHaveBeenCalled();
  });

  it('treats empty output as invalid rather than passing it on', async () => {
    generateContent.mockResolvedValue(reply('   '));
    const result = await generateText('p');
    expect(result).toMatchObject({ ok: false, reason: 'invalid_output' });
  });

  it('reports an upstream error (e.g. 429 quota) without throwing', async () => {
    generateContent.mockRejectedValue(
      new Error('[GoogleGenerativeAI Error]: [429] quota exceeded'),
    );

    const result = await generateText('p');
    expect(result).toMatchObject({ ok: false, reason: 'upstream_error' });
  });

  it('times out rather than hanging the control room', async () => {
    // A call that only settles when its abort signal fires.
    generateContent.mockImplementation(
      (_request, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );

    const result = await generateText('p', 20);
    expect(result).toMatchObject({ ok: false, reason: 'timeout' });
  });

  it('never leaks the API key into a failure detail', async () => {
    generateContent.mockRejectedValue(
      new Error('fetch failed: https://host/models/x:generateContent?key=test-key'),
    );

    const result = await generateText('p');
    expect(JSON.stringify(result)).not.toContain('test-key');
  });
});

describe('generateJson', () => {
  const schema = z.object({ reasoning: z.string().min(3) });

  it('returns validated output on success', async () => {
    generateContent.mockResolvedValue(reply('{"reasoning":"because"}'));
    await expect(generateJson('p', schema)).resolves.toEqual({
      ok: true,
      value: { reasoning: 'because' },
    });
  });

  it('unwraps a fenced response', async () => {
    generateContent.mockResolvedValue(reply('```json\n{"reasoning":"because"}\n```'));
    const result = await generateJson('p', schema);
    expect(result.ok).toBe(true);
  });

  it('rejects output of the wrong shape rather than passing it downstream', async () => {
    generateContent.mockResolvedValue(reply('{"nonsense":true}'));

    const result = await generateJson('p', schema);
    expect(result).toMatchObject({ ok: false, reason: 'invalid_output' });
  });

  it('rejects malformed JSON', async () => {
    generateContent.mockResolvedValue(reply('{"reasoning": '));
    const result = await generateJson('p', schema);
    expect(result).toMatchObject({ ok: false, reason: 'invalid_output' });
  });

  it('rejects prose where JSON was demanded', async () => {
    generateContent.mockResolvedValue(reply('I think you should reroute the fans.'));
    const result = await generateJson('p', schema);
    expect(result).toMatchObject({ ok: false, reason: 'invalid_output' });
  });

  it('propagates a timeout as a timeout, not a parse failure', async () => {
    generateContent.mockImplementation(
      (_request, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const result = await generateJson('p', schema, 20);
    expect(result).toMatchObject({ ok: false, reason: 'timeout' });
  });

  it('never throws, whatever the model returns', async () => {
    for (const text of ['', 'null', '[]', '{}', 'undefined', '{{{']) {
      generateContent.mockResolvedValue(reply(text));
      await expect(generateJson('p', schema)).resolves.toBeDefined();
    }
  });
});
