import { ChatErrorType } from '@lobechat/types';
import { type OpenAISTTPayload } from '@lobehub/tts';
import { createOpenaiAudioTranscriptions } from '@lobehub/tts/server';
import OpenAI from 'openai';

import { getOpenAIAuthFromRequest } from '@/const/fetch';
import { getLLMConfig } from '@/envs/llm';
import { createErrorResponse } from '@/utils/errorResponse';

export const POST = async (req: Request) => {
  const formData = await req.formData();
  const speechBlob = formData.get('speech') as Blob;
  const optionsString = formData.get('options') as string;
  const payload = {
    options: JSON.parse(optionsString),
    speech: speechBlob,
  } as OpenAISTTPayload;

  const { apiKey: userApiKey, endpoint: userEndpoint } = getOpenAIAuthFromRequest(req);
  const { OPENROUTER_API_KEY } = getLLMConfig();
  const apiKey = userApiKey || OPENROUTER_API_KEY;
  const baseURL = userEndpoint || process.env.OPENROUTER_PROXY_URL || undefined;

  if (!apiKey) return createErrorResponse(ChatErrorType.Unauthorized);

  const openrouter = new OpenAI({ apiKey, baseURL });

  const res = await createOpenaiAudioTranscriptions({
    openai: openrouter as any,
    payload,
  });

  return new Response(JSON.stringify(res), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
};
