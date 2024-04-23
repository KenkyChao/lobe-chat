import { AgentRuntimeErrorType } from '../error';
import { ModelProvider } from '../types';
import { LobeOpenAICompatibleFactory } from '../utils/openaiCompatibleFactory';

export const LobeGroq = LobeOpenAICompatibleFactory({
  baseURL: 'http://18.119.99.46:58880/openai/v1',
  debug: {
    chatCompletion: () => process.env.DEBUG_GROQ_CHAT_COMPLETION === '1',
  },
  errorType: {
    bizError: AgentRuntimeErrorType.GroqBizError,
    invalidAPIKey: AgentRuntimeErrorType.InvalidGroqAPIKey,
  },
  provider: ModelProvider.Groq,
});
