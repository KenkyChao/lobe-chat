'use client';

import { Flexbox, Text } from '@lobehub/ui';
import { memo } from 'react';

import { type MessengerPlatform, PlatformAvatar } from '../constants';

export interface LinkModalContentProps {
  appId?: string;
  botUsername?: string;
  name: string;
  platform: MessengerPlatform;
}

const LinkModalContent = memo<LinkModalContentProps>(({ name, platform }) => (
  <Flexbox align={'center'} gap={20} style={{ paddingBlockEnd: 16, paddingBlockStart: 24 }}>
    <PlatformAvatar platform={platform} size={64} />
    <Flexbox align="center" gap={8}>
      <Text strong style={{ fontSize: 18 }}>
        {name}
      </Text>
      <Text type="secondary">请按照该平台 Bot 配置完成消息频道接入。</Text>
    </Flexbox>
  </Flexbox>
));

LinkModalContent.displayName = 'MessengerLinkModalContent';

export default LinkModalContent;
