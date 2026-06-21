'use client';

import { Text } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const AuthAgreement = memo(() => {
  const { t } = useTranslation('auth');
  return (
    <Text fontSize={13} style={{ display: 'block', marginBlockStart: 8 }} type={'secondary'}>
      {t('footer.agreement')}
    </Text>
  );
});

export default AuthAgreement;
