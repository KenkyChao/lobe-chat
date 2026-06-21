import { DEFAULT_FILES_CONFIG } from '@/const/settings/knowledge';
import { type SystemEmbeddingConfig } from '@/types/knowledgeBase';
import { type FilesConfig } from '@/types/user/settings/filesConfig';

const protectedKeys = Object.keys({
  embedding_model: null,
  query_mode: null,
  reranker_model: null,
});
const defaultProviderForBareModel = 'openrouter';

const parseProviderModelValue = (value: string) => {
  const [provider, ...modelParts] = value.split('/');
  const model = modelParts.join('/');

  if (!value.includes('/') && provider) {
    return { model: provider.trim(), provider: defaultProviderForBareModel };
  }

  if (!provider || !model) {
    return;
  }

  return { model: model.trim(), provider: provider.trim() };
};

export const parseFilesConfig = (envString: string = ''): SystemEmbeddingConfig => {
  if (!envString) return DEFAULT_FILES_CONFIG;
  const config: FilesConfig = {} as any;

  // Handle full-width commas and extra spaces
  const envValue = envString.replaceAll('，', ',').trim();

  const pairs = envValue.split(',');

  for (const pair of pairs) {
    const [key, value] = pair.split('=').map((s) => s.trim());

    if (key && value) {
      if (protectedKeys.includes(key)) {
        switch (key) {
          case 'embedding_model': {
            const parsedValue = parseProviderModelValue(value);

            if (!parsedValue) {
              throw new Error(
                'Invalid environment variable format. expected embedding_model=provider/model or embedding_model=model',
              );
            }

            config.embeddingModel = parsedValue;
            break;
          }
          case 'reranker_model': {
            const parsedValue = parseProviderModelValue(value);

            if (!parsedValue) {
              throw new Error(
                'Invalid environment variable format. expected reranker_model=provider/model or reranker_model=model',
              );
            }

            config.rerankerModel = parsedValue;
            break;
          }
          case 'query_mode': {
            config.queryMode = value;
            break;
          }
          default: {
            throw new Error(
              'Invalid environment variable format. expected one of embedding_model, reranker_model, query_mode',
            );
          }
        }
      }
    } else {
      throw new Error('Invalid environment variable format.');
    }
  }
  return config;
};
