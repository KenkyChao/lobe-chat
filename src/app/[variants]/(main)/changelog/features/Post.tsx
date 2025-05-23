import { Typography } from '@lobehub/ui';
import { Divider } from 'antd';
import Link from 'next/link';
import urlJoin from 'url-join';

import { CustomMDX } from '@/components/mdx';
import Image from '@/components/mdx/Image';
import { OFFICIAL_SITE } from '@/const/url';
import { Locales } from '@/locales/resources';
import { ChangelogService } from '@/server/services/changelog';
import { ChangelogIndexItem } from '@/types/changelog';

import GridLayout from './GridLayout';
import PublishedTime from './PublishedTime';
import VersionTag from './VersionTag';

const Post = async ({
  id,
  mobile,
  versionRange,
  locale,
}: ChangelogIndexItem & { branch?: string; locale: Locales; mobile?: boolean }) => {
  const changelogService = new ChangelogService();

  // 解决 github的changelog 无法拉取问题。
  let data = null;
  try {
    data = await changelogService.getPostById(id, { locale });
  } catch (error) {
    console.warn(`Failed to fetch changelog post ${id}:`, error);
    // 这里返回 null 或者一个默认数据，避免构建崩溃
    data = null;
  }

  if (!data || !data.title) return null;

  return (
    <>
      <Divider />
      <GridLayout
        date={
          <PublishedTime
            date={data.date.toISOString()}
            style={{ lineHeight: mobile ? undefined : '60px' }}
            template={'MMMM D, YYYY'}
          />
        }
        mobile={mobile}
      >
        <Typography headerMultiple={mobile ? 0.2 : 0.3}>
          <Link href={urlJoin(OFFICIAL_SITE, '/changelog', id)} style={{ color: 'inherit' }}>
            <h1 id={id}>{data.rawTitle || data.title}</h1>
          </Link>
          <Image alt={data.title} src={data.image} />
          <CustomMDX source={data.content} />
          <Link href={urlJoin(OFFICIAL_SITE, '/changelog', id)} style={{ color: 'inherit' }}>
            <VersionTag range={versionRange} />
          </Link>
        </Typography>
      </GridLayout>
    </>
  );
};

export default Post;
