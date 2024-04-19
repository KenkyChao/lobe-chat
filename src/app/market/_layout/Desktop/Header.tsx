// import { ChatHeader, Logo } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import Link from 'next/link';
import { memo } from 'react';

import ShareAgentButton from '../../features/ShareAgentButton';

export const useStyles = createStyles(({ css, token }) => ({
  logo: css`
    color: ${token.colorText};
    fill: ${token.colorText};
  `,
}));

const Header = memo(() => {
  // const { styles } = useStyles();

  return (
    <ChatHeader
      left={
        <Link aria-label={'home'} href={'/'}>
          {/*<Logo className={styles.logo} extra={'Discover'} size={36} type={'text'} />*/}
          <strong style={ {fontSize: '1.7em' }}>NaiYun</strong>
        </Link>
      }
      right={<ShareAgentButton />}
    />
  );
});

export default Header;
