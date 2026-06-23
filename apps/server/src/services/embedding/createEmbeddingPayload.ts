import type { EmbeddingsPayload } from '@lobechat/model-runtime';

const DIMENSION_CONFIGURABLE_MODELS = new Set([
  'openai/text-embedding-3-large',
  'openai/text-embedding-3-small',
  'text-embedding-3-large',
  'text-embedding-3-small',
]);

const supportsEmbeddingDimensions = (model: string) =>
  DIMENSION_CONFIGURABLE_MODELS.has(model.trim().toLowerCase());

interface CreateEmbeddingPayloadParams {
  dimensions?: number;
  input: EmbeddingsPayload['input'];
  model: string;
}

export const createEmbeddingPayload = ({
  dimensions,
  input,
  model,
}: CreateEmbeddingPayloadParams): EmbeddingsPayload => {
  const payload: EmbeddingsPayload = { input, model };

  if (dimensions && supportsEmbeddingDimensions(model)) {
    payload.dimensions = dimensions;
  }

  return payload;
};
