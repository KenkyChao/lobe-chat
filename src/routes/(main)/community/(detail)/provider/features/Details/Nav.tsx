'use client';

import { BRANDING_PROVIDER } from '@lobechat/business-const';
import { Flexbox, Icon, Tabs } from '@lobehub/ui';
import { createStaticStyles } from 'antd-style';
import { BookOpenIcon, BrainCircuitIcon, ListIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { ProviderNavKey } from '@/types/discover';

import { useDetailContext } from '../DetailProvider';

const styles = createStaticStyles(({ css, cssVar }) => {
  return {
    nav: css`
      border-block-end: 1px solid ${cssVar.colorBorder};
    `,
  };
});

interface NavProps {
  activeTab?: ProviderNavKey;
  mobile?: boolean;
  setActiveTab?: (tab: ProviderNavKey) => void;
}

const Nav = memo<NavProps>(({ mobile, setActiveTab, activeTab = ProviderNavKey.Overview }) => {
  const { t } = useTranslation('discover');
  const { identifier } = useDetailContext();

  // Hide Guide tab for branding provider as it doesn't have integration docs
  const showGuideTab = identifier !== BRANDING_PROVIDER;

  const items = [
    {
      icon: <Icon icon={BookOpenIcon} size={16} />,
      key: ProviderNavKey.Overview,
      label: t('providers.details.overview.title'),
    },
    ...(showGuideTab
      ? [
          {
            icon: <Icon icon={BrainCircuitIcon} size={16} />,
            key: ProviderNavKey.Guide,
            label: t('providers.details.guide.title'),
          },
        ]
      : []),
    {
      icon: <Icon icon={ListIcon} size={16} />,
      key: ProviderNavKey.Related,
      label: t('providers.details.related.title'),
    },
  ];

  const nav = (
    <Tabs
      activeKey={activeTab}
      compact={mobile}
      items={items}
      onChange={(key) => setActiveTab?.(key as ProviderNavKey)}
    />
  );

  return mobile ? (
    nav
  ) : (
    <Flexbox horizontal align={'center'} className={styles.nav} justify={'space-between'}>
      {nav}
    </Flexbox>
  );
});

export default Nav;
