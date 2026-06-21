import { OpenAI } from '@lobehub/icons';
import { type SelectProps } from '@lobehub/ui';

import { LabelRenderer } from '@/components/ModelSelect';

export const ttsOptions: SelectProps['options'] = [
  {
    label: <LabelRenderer Icon={OpenAI.Avatar} label={'OpenAI'} />,
    value: 'openai',
  },
];
