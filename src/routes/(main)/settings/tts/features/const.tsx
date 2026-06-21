import { OpenAI } from '@lobehub/icons';
import { type SelectProps } from '@lobehub/ui/base-ui';

import { LabelRenderer } from '@/components/ModelSelect';

export const opeanaiTTSOptions: SelectProps['options'] = [
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'edge-tts'} />,
    value: 'edge-tts',
  },
];

export const opeanaiSTTOptions: SelectProps['options'] = [
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'Qwen3-ASR-1.7B'} />,
    value: 'Qwen3-ASR-1.7B',
  },
];

export const sttOptions: SelectProps['options'] = [
  {
    label: 'OpenAI',
    value: 'openai',
  },
  {
    label: 'OpenRouter',
    value: 'openrouter',
  },
  {
    label: 'Browser',
    value: 'browser',
  },
];
