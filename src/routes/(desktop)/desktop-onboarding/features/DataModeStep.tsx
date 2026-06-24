'use client';

import { Block, Button, Checkbox, Flexbox, Text } from '@lobehub/ui';
import { cssVar } from 'antd-style';
import { Undo2Icon } from 'lucide-react';
import { memo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useUserStore } from '@/store/user';
import { userGeneralSettingsSelectors } from '@/store/user/selectors';

import LobeMessage from '../components/LobeMessage';
import OnboardingFooterActions from '../components/OnboardingFooterActions';

interface DataModeStepProps {
  onBack: () => void;
  onNext: () => void;
}

const DataModeStep = memo<DataModeStepProps>(({ onBack, onNext }) => {
  const { t } = useTranslation('desktop-onboarding');
  const telemetryEnabled = useUserStore(userGeneralSettingsSelectors.telemetry);
  const updateGeneralConfig = useUserStore((s) => s.updateGeneralConfig);

  useEffect(() => {
    if (telemetryEnabled) {
      void updateGeneralConfig({ telemetry: false });
    }
  }, [telemetryEnabled, updateGeneralConfig]);

  const checkIcon = (
    <Checkbox
      checked
      backgroundColor={cssVar.colorSuccess}
      shape={'circle'}
      size={20}
      style={{ position: 'absolute', right: 12, top: 12 }}
    />
  );

  return (
    <Flexbox gap={16} style={{ height: '100%', minHeight: '100%' }}>
      <Flexbox>
        <LobeMessage sentences={[t('screen4.title'), t('screen4.title2'), t('screen4.title3')]} />
        <Text as={'p'}>{t('screen4.description')}</Text>
      </Flexbox>
      <Flexbox gap={16} style={{ width: '100%' }}>
        <Block
          flex={1}
          gap={6}
          padding={16}
          style={{ borderColor: cssVar.colorSuccess }}
          variant={'outlined'}
        >
          {checkIcon}
          <Text strong fontSize={18}>
            {t('screen4.privacy.title')}
          </Text>
          <Text fontSize={14} type={'secondary'}>
            {t('screen4.privacy.description')}
          </Text>
        </Block>
      </Flexbox>
      <OnboardingFooterActions
        left={
          <Button
            icon={Undo2Icon}
            style={{ color: cssVar.colorTextDescription }}
            type={'text'}
            onClick={onBack}
          >
            {t('back')}
          </Button>
        }
        right={
          <Button type={'primary'} onClick={onNext}>
            {t('next')}
          </Button>
        }
      />
    </Flexbox>
  );
});

DataModeStep.displayName = 'DataModeStep';

export default DataModeStep;
