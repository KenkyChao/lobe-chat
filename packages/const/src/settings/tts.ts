import type { UserTTSConfig } from '@lobechat/types';

export const DEFAULT_TTS_CONFIG: UserTTSConfig = {
  openAI: {
    sttModel: 'Qwen3-ASR-1.7B',
    ttsModel: 'edge-tts',
  },
  sttAutoStop: true,
  sttServer: 'openrouter',
};
