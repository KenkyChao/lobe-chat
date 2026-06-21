'use client';

import { Flexbox } from '@lobehub/ui';
import { memo } from 'react';

import ForkAndChat from './ForkAndChat';

const ActionButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  return (
    <Flexbox horizontal align={'center'} gap={8}>
      <ForkAndChat mobile={mobile} />
    </Flexbox>
  );
});

export default ActionButton;
