import { describe, expect, it } from 'vitest';

import { DEFAULT_HOME_NEW_MODELS, NEW_CHAT_PROVIDER } from './starterModels';

describe('starter models', () => {
  it('uses the configured OpenAI-compatible provider for home shortcut models', () => {
    expect(NEW_CHAT_PROVIDER).toBe('openai');
  });

  it('keeps the fallback home shortcut model entries in the configured product order', () => {
    expect(DEFAULT_HOME_NEW_MODELS).toEqual([
      {
        model: 'Qwen3.6-35B-A3B',
        provider: NEW_CHAT_PROVIDER,
        title: 'Qwen3.6-35B-A3B',
        type: 'chat',
      },
      {
        model: 'Qwen3.6-27B',
        provider: NEW_CHAT_PROVIDER,
        title: 'Qwen3.6-27B',
        type: 'chat',
      },
      {
        model: 'DeepSeek-V4-Flash',
        provider: NEW_CHAT_PROVIDER,
        title: 'DeepSeek-V4-Flash',
        type: 'chat',
      },
      {
        model: 'DeepSeek-V4-Pro',
        provider: NEW_CHAT_PROVIDER,
        title: 'DeepSeek-V4-Pro',
        type: 'chat',
      },
    ]);
  });
});
