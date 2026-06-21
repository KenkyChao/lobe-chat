'use client';

import { VoiceList } from '@lobehub/tts';
import { type FormGroupItemType } from '@lobehub/ui';
import { Form, Select } from '@lobehub/ui';
import isEqual from 'fast-deep-equal';
import { Mic } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';

import { selectors, useStore } from '../store';
import { ttsOptions } from './options';
import SelectWithTTSPreview from './SelectWithTTSPreview';

const TTS_SETTING_KEY = 'tts';
const { localeOptions } = VoiceList;

const AgentTTS = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();
  const config = useStore(selectors.currentTtsConfig, isEqual);
  const [disabled, updateConfig] = useStore((s) => [s.disabled, s.setAgentConfig]);
  const edgeVoiceOptions = useMemo(() => new VoiceList().edgeVoiceOptions, []);
  const edgeVoiceValues = useMemo(
    () => new Set(edgeVoiceOptions?.map((option) => option.value as string)),
    [edgeVoiceOptions],
  );
  const defaultEdgeVoice =
    (edgeVoiceOptions?.[0]?.value as string | undefined) || 'zh-CN-XiaoxiaoNeural';
  const currentOpenAIVoice = config.voice?.openai;
  const formConfig = {
    ...config,
    ttsService: 'openai' as const,
    voice: {
      ...config.voice,
      openai:
        currentOpenAIVoice && edgeVoiceValues.has(currentOpenAIVoice)
          ? currentOpenAIVoice
          : config.voice?.edge || defaultEdgeVoice,
    },
  };

  const tts: FormGroupItemType = {
    children: [
      {
        children: <Select options={ttsOptions} />,
        desc: t('settingTTS.ttsService.desc'),
        label: t('settingTTS.ttsService.title'),
        name: [TTS_SETTING_KEY, 'ttsService'],
      },
      {
        children: <SelectWithTTSPreview options={edgeVoiceOptions} server={'openai'} />,
        desc: t('settingTTS.voice.desc'),
        label: t('settingTTS.voice.title'),
        name: [TTS_SETTING_KEY, 'voice', 'openai'],
      },
      {
        children: (
          <Select
            options={[
              { label: t('settingCommon.lang.autoMode'), value: 'auto' },
              ...(localeOptions || []),
            ]}
          />
        ),
        desc: t('settingTTS.sttLocale.desc'),
        label: t('settingTTS.sttLocale.title'),
        name: [TTS_SETTING_KEY, 'sttLocale'],
      },
    ],
    icon: Mic,
    title: t('settingTTS.title'),
  };

  return (
    <Form
      disabled={disabled}
      footer={<Form.SubmitFooter />}
      form={form}
      items={[tts]}
      itemsType={'group'}
      variant={'borderless'}
      initialValues={{
        [TTS_SETTING_KEY]: formConfig,
      }}
      onFinish={(values) => {
        if (disabled) return;

        updateConfig(values);
      }}
      {...FORM_STYLE}
    />
  );
});

export default AgentTTS;
