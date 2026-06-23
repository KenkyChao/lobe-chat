import { Typography } from '@lobehub/ui';
import { Divider } from 'antd';
import { type ComponentPropsWithoutRef, Fragment, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { CustomMDX } from '@/components/mdx';
import { lambdaClient } from '@/libs/trpc/client';
import { type Locales } from '@/locales/resources';
import { type ChangelogIndexItem } from '@/types/changelog';

import VersionTag from './VersionTag';

interface ChangelogContentProps {
  data: ChangelogIndexItem[];
}

interface PostItemProps extends ChangelogIndexItem {
  locale: Locales;
  showDivider?: boolean;
}

const Link = ({ children, href, ...rest }: ComponentPropsWithoutRef<'a'> & { href?: string }) => {
  if (!href || /^https?:\/\//.test(href)) return <span>{children}</span>;

  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
};

const PostItem = ({ id, versionRange, locale, showDivider = true }: PostItemProps) => {
  const { data } = useSWR([`changelog-post-${id}`, locale], async () => {
    return await lambdaClient.changelog.getPostById.query({ id, locale });
  });

  if (!data || !data.title) return null;

  return (
    <>
      {showDivider && <Divider />}
      <Typography headerMultiple={0.2}>
        <h2 id={id}>{data.rawTitle || data.title}</h2>
        <Suspense fallback={<div>Loading...</div>}>
          <CustomMDX components={{ a: Link }} source={data.content} />
        </Suspense>
        <VersionTag range={versionRange} />
      </Typography>
    </>
  );
};

const ChangelogContent = ({ data }: ChangelogContentProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language as Locales;

  return (
    <>
      {data.map((item, index) => (
        <Fragment key={item.id}>
          <PostItem locale={locale} showDivider={index !== 0} {...item} />
        </Fragment>
      ))}
    </>
  );
};

export default ChangelogContent;
