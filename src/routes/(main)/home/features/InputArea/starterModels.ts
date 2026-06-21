import type { HomeNewModelItem } from '@/business/client/hooks/useHomeNewModels';

export const NEW_CHAT_PROVIDER = 'openai';

export const DEFAULT_HOME_NEW_MODELS = [
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
] satisfies HomeNewModelItem[];
