import { readFile } from 'node:fs/promises';
import nodePath from 'node:path';

import matter from 'gray-matter';
import type { Metadata } from 'next';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import remarkGfm from 'remark-gfm';

import { ChangelogService } from '@/server/services/changelog';
import { type ChangelogIndexItem } from '@/types/changelog';
import { RouteVariants } from '@/utils/server/routeVariants';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug?: string[]; variants: string }>;
};

type Frontmatter = {
  description?: string;
  title?: string;
};

type ChangelogDoc = {
  content: ReactNode;
  date?: string;
  description: string;
  id: string;
  title: string;
  versionRange?: string[];
};

const copy = {
  en: {
    back: 'Back to all changelogs',
    dateLabel: 'Date',
    description:
      'Track NaiYunHub product updates, desktop releases, deployment changes, and fixes.',
    empty: 'No changelog entries are available yet.',
    eyebrow: 'NaiYunHub Changelog',
    title: 'Changelog',
    versionLabel: 'Version',
  },
  zh: {
    back: '返回全部更新日志',
    dateLabel: '日期',
    description: '追踪 NaiYunHub 的产品更新、桌面端发布、部署调整与问题修复。',
    empty: '暂时还没有更新日志。',
    eyebrow: 'NaiYunHub 更新日志',
    title: '更新日志',
    versionLabel: '版本',
  },
};

const isZh = (locale: string) => locale.startsWith('zh');

const resolveFilename = (id: string, locale: string) =>
  isZh(locale) ? `${id}.zh-CN.mdx` : `${id}.mdx`;

const resolveFilePath = (id: string, locale: string) =>
  nodePath.join(process.cwd(), 'docs/changelog', resolveFilename(id, locale));

const stripLeadingTitle = (content: string) => {
  const lines = content.split('\n');
  const firstMeaningfulLine = lines.findIndex((line) => line.trim().length > 0);

  if (firstMeaningfulLine !== -1 && /^#\s+/.test(lines[firstMeaningfulLine])) {
    lines.splice(firstMeaningfulLine, 1);
  }

  return lines.join('\n').replace(/^\s+/, '');
};

const extractTitle = (content: string, fallback: string) => {
  for (const line of content.split('\n')) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith('# ')) return trimmed.slice(2).trim() || fallback;
  }

  return fallback;
};

const Link = ({ children, href, ...rest }: ComponentPropsWithoutRef<'a'> & { href?: string }) => {
  if (!href) return <span>{children}</span>;

  if (href.startsWith('/')) {
    return (
      <NextLink {...rest} className={styles.link} href={href}>
        {children}
      </NextLink>
    );
  }

  void rest;
  return <span>{children}</span>;
};

const getDoc = async (
  item: ChangelogIndexItem,
  locale: string,
  compileContent = false,
): Promise<ChangelogDoc | null> => {
  try {
    const raw = await readFile(resolveFilePath(item.id, locale), 'utf8');
    const { content, data } = matter(raw);
    const title = typeof data.title === 'string' ? data.title : extractTitle(content, item.id);
    const description = typeof data.description === 'string' ? data.description : '';
    const normalizedContent = stripLeadingTitle(content);

    const compiled = compileContent
      ? await compileMDX<Frontmatter>({
          components: {
            a: Link,
          },
          options: {
            mdxOptions: {
              remarkPlugins: [remarkGfm],
            },
            parseFrontmatter: false,
          },
          source: normalizedContent,
        })
      : undefined;

    return {
      content: compiled?.content,
      date: item.date,
      description,
      id: item.id,
      title,
      versionRange: item.versionRange,
    };
  } catch {
    return null;
  }
};

const createService = () => {
  const service = new ChangelogService();
  service.config.source = 'local';

  return service;
};

export const generateMetadata = async (props: PageProps): Promise<Metadata> => {
  const { slug = [] } = await props.params;
  const locale = await RouteVariants.getLocale(props);
  const text = copy[isZh(locale) ? 'zh' : 'en'];
  const id = slug[0] === 'modal' ? undefined : slug[0];

  if (!id) {
    return {
      description: text.description,
      title: `${text.title} · NaiYunHub`,
    };
  }

  const service = createService();
  const item = await service.getIndexItemById(id);
  const doc = item ? await getDoc(item, locale) : null;

  return {
    description: doc?.description || text.description,
    title: `${doc?.title || text.title} · NaiYunHub`,
  };
};

const ChangelogPage = async (props: PageProps) => {
  const { slug = [] } = await props.params;
  const locale = await RouteVariants.getLocale(props);
  const text = copy[isZh(locale) ? 'zh' : 'en'];
  const id = slug[0] === 'modal' ? undefined : slug[0];
  const service = createService();
  const index = await service.getChangelogIndex(Number.POSITIVE_INFINITY);

  if (id) {
    const item = await service.getIndexItemById(id);
    const doc = item ? await getDoc(item, locale, true) : null;

    if (!doc) notFound();

    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <NextLink className={styles.backLink} href="/changelog">
            {text.back}
          </NextLink>
          <article className={styles.article}>
            <header className={styles.articleHeader}>
              <p className={styles.eyebrow}>{text.eyebrow}</p>
              <h1>{doc.title}</h1>
              {doc.description && <p className={styles.description}>{doc.description}</p>}
              <div className={styles.meta}>
                {doc.date && (
                  <span>
                    {text.dateLabel}: {doc.date}
                  </span>
                )}
                {doc.versionRange && doc.versionRange.length > 0 && (
                  <span>
                    {text.versionLabel}: {doc.versionRange.map((v) => `v${v}`).join(' - ')}
                  </span>
                )}
              </div>
            </header>
            <div className={styles.content}>{doc.content}</div>
          </article>
        </div>
      </main>
    );
  }

  const docs = (await Promise.all(index.map((item) => getDoc(item, locale)))).filter(
    Boolean,
  ) as ChangelogDoc[];

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <img alt="NaiYunHub" className={styles.logo} src="/icons/naiyunhub-logo.png" />
          <div>
            <p className={styles.eyebrow}>{text.eyebrow}</p>
            <h1>{text.title}</h1>
            <p className={styles.description}>{text.description}</p>
          </div>
        </header>

        {docs.length === 0 ? (
          <p className={styles.empty}>{text.empty}</p>
        ) : (
          <div className={styles.list}>
            {docs.map((doc) => (
              <article className={styles.card} key={doc.id}>
                <div>
                  <div className={styles.meta}>
                    {doc.date && <span>{doc.date}</span>}
                    {doc.versionRange && doc.versionRange.length > 0 && (
                      <span>{doc.versionRange.map((v) => `v${v}`).join(' - ')}</span>
                    )}
                  </div>
                  <h2>{doc.title}</h2>
                  {doc.description && <p>{doc.description}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default ChangelogPage;
