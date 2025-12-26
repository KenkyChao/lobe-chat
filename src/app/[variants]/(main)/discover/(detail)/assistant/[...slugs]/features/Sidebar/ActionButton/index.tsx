'use client';

import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import AddAgent from './AddAgent';

const ActionButton = memo<{ mobile?: boolean }>(({ mobile }) => {
  return (
    <Flexbox align={'center'} gap={8} horizontal>
      <AddAgent mobile={mobile} />

    </Flexbox>
  );
});

export default ActionButton;
