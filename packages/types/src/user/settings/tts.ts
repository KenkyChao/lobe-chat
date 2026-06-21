export type STTServer = 'openai' | 'openrouter' | 'browser';

export interface UserTTSConfig {
  openAI: {
    sttModel: string;
    ttsModel: string;
  };
  sttAutoStop: boolean;
  sttServer: STTServer;
}
