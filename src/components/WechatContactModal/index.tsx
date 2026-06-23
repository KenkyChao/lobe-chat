'use client';

import { BRANDING_WECHAT_QR_URL } from '@lobechat/business-const';
import { Button, Flexbox, Text } from '@lobehub/ui';
import { createModal } from '@lobehub/ui/base-ui';
import { t } from 'i18next';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const WECHAT_APP_URL = 'weixin://';

const WechatContactContent = memo(() => {
  const { t: tCommon } = useTranslation('common');

  const handleOpenWechat = useCallback(() => {
    window.location.assign(WECHAT_APP_URL);
  }, []);

  return (
    <Flexbox align={'center'} gap={16}>
      <img
        alt={tCommon('userPanel.wechatModal.qrAlt')}
        decoding="async"
        loading="eager"
        src={BRANDING_WECHAT_QR_URL}
        style={{
          background: '#fff',
          borderRadius: 8,
          display: 'block',
          height: 'auto',
          maxWidth: '100%',
          objectFit: 'contain',
          padding: 8,
          width: 260,
        }}
      />
      <Text
        type={'secondary'}
        style={{
          textAlign: 'center',
        }}
      >
        {tCommon('userPanel.wechatModal.description')}
      </Text>
      <Button
        type={'primary'}
        style={{
          maxWidth: '100%',
          width: 260,
        }}
        onClick={handleOpenWechat}
      >
        {tCommon('userPanel.wechatModal.openWechat')}
      </Button>
    </Flexbox>
  );
});

WechatContactContent.displayName = 'WechatContactContent';

export const openWechatContactModal = () =>
  createModal({
    content: <WechatContactContent />,
    footer: null,
    maskClosable: true,
    title: t('userPanel.wechatModal.title', { ns: 'common' }),
    width: 'min(90vw, 360px)',
  });

export default openWechatContactModal;
