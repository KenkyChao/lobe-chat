'use client';

import { Button, Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';

import { type MessengerPlatform, PlatformAvatar } from '../constants';

interface IntegrationDetailProps {
  appId?: string;
  botUsername?: string;
  /** Brand-name label (e.g. `"Slack"`) sourced from the registry. */
  name: string;
  onBack: () => void;
  platform: MessengerPlatform;
}

const IntegrationDetail = memo<IntegrationDetailProps>(({ platform, ...rest }) => (
  <Flexbox align="center" gap={16} style={{ paddingBlock: 32 }}>
    <PlatformAvatar platform={platform} size={64} />
    <Flexbox align="center" gap={8}>
      <Text strong style={{ fontSize: 18 }}>
        {rest.name}
      </Text>
      <Text type="secondary">请在「助理 → 消息频道」中配置该平台的 Bot。</Text>
    </Flexbox>
    <Button onClick={rest.onBack}>返回</Button>
  </Flexbox>
));

IntegrationDetail.displayName = 'MessengerIntegrationDetail';

export default IntegrationDetail;
