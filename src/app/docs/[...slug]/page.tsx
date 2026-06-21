import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import matter from 'gray-matter';
import type { Metadata } from 'next';
import NextLink from 'next/link';
import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { isValidElement } from 'react';
import remarkGfm from 'remark-gfm';

import styles from './page.module.css';
import TocNav from './TocNav';

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

type Frontmatter = {
  description?: string;
  title?: string;
};

type Heading = {
  id: string;
  level: 2 | 3;
  title: string;
};

type DocNavItem = {
  href: string;
  title: string;
};

type DocNavSection = {
  items: DocNavItem[];
  title: string;
};

const OFFICIAL_SITE = 'https://lobehub.com';
const ENTERPRISE_DOC_PREFIX = '/docs/usage/enterprise/';
const DOC_NAV: DocNavSection[] = [
  {
    items: [
      {
        href: '/docs/usage/enterprise/start',
        title: '手册总览',
      },
    ],
    title: '开始使用',
  },
  {
    items: [
      {
        href: '/docs/usage/enterprise/models',
        title: '模型选择',
      },
      {
        href: '/docs/usage/enterprise/codex',
        title: 'Codex',
      },
    ],
    title: '企业员工手册',
  },
];

const resolveDocPath = (slug: string[]) => {
  const basePath = join(process.cwd(), 'docs', ...slug);
  const candidates = [`${basePath}.zh-CN.mdx`, `${basePath}.mdx`];

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }

  return null;
};

const resolveHref = (href?: string) => {
  if (!href) return '#';
  if (href.startsWith(ENTERPRISE_DOC_PREFIX)) return href;
  if (href.startsWith('/zh/docs/usage/enterprise/')) return href.replace('/zh', '');
  if (href.startsWith('/zh/docs/') || href.startsWith('/docs/')) return `${OFFICIAL_SITE}${href}`;
  return href;
};

const isExternalHref = (href: string) => /^https?:\/\//.test(href);

const stripInlineMarkdown = (value: string) =>
  value
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~]/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();

const slugifyHeading = (value: string) =>
  stripInlineMarkdown(value)
    .toLowerCase()
    .replace(/[()[\]{}:,.!?/\\]/g, '')
    .replace(/\s+/g, '-');

const stripLeadingTitle = (content: string) => {
  const lines = content.split('\n');
  const firstMeaningfulLine = lines.findIndex((line) => line.trim().length > 0);

  if (firstMeaningfulLine !== -1 && /^#\s+/.test(lines[firstMeaningfulLine])) {
    lines.splice(firstMeaningfulLine, 1);
  }

  return lines.join('\n').replace(/^\s+/, '');
};

const extractHeadings = (content: string): Heading[] => {
  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();
  let inCodeBlock = false;

  for (const line of content.split('\n')) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const trimmed = line.trim();
    const level = trimmed.startsWith('### ') ? 3 : trimmed.startsWith('## ') ? 2 : null;

    if (!level) continue;

    const title = stripInlineMarkdown(trimmed.slice(level + 1));
    const baseSlug = slugifyHeading(title) || `section-${headings.length + 1}`;
    const count = slugCounts.get(baseSlug) ?? 0;
    slugCounts.set(baseSlug, count + 1);

    headings.push({
      id: count === 0 ? baseSlug : `${baseSlug}-${count + 1}`,
      level,
      title,
    });
  }

  return headings;
};

const extractTextFromNode = (node: ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromNode).join('');
  if (!isValidElement<{ children?: ReactNode }>(node)) return '';
  return extractTextFromNode(node.props.children);
};

const createHeadingComponent = (
  level: 2 | 3,
  headings: Heading[],
  renderedCounts: Map<string, number>,
) => {
  const Tag = `h${level}` as 'h2' | 'h3';

  return ({ children }: { children: ReactNode }) => {
    const title = extractTextFromNode(children).trim();
    const headingKey = `${level}:${title}`;
    const currentIndex = renderedCounts.get(headingKey) ?? 0;
    const matchedHeadings = headings.filter((heading) => heading.level === level && heading.title === title);
    const id =
      matchedHeadings[currentIndex]?.id || slugifyHeading(title) || `section-${level}-${currentIndex + 1}`;

    renderedCounts.set(headingKey, currentIndex + 1);

    return (
      <Tag className={styles.heading} id={id}>
        <a className={styles.headingAnchor} href={`#${id}`}>
          {children}
        </a>
      </Tag>
    );
  };
};

const DocLink = ({
  children,
  href,
  ...rest
}: ComponentPropsWithoutRef<'a'> & { href?: string }) => {
  const resolved = resolveHref(href);
  const external = isExternalHref(resolved);

  if (!external && resolved.startsWith('/')) {
    return (
      <NextLink {...rest} className={styles.link} href={resolved}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      {...rest}
      className={styles.link}
      href={resolved}
      rel={external ? 'noopener noreferrer' : rest.rel}
      target={external ? '_blank' : rest.target}
    >
      {children}
    </a>
  );
};

const Callout = ({
  children,
  type = 'info',
}: {
  children: ReactNode;
  type?: 'default' | 'info' | 'warning';
}) => <div className={styles.callout} data-type={type}>{children}</div>;

const Cards = ({ children }: { children: ReactNode }) => <div className={styles.cards}>{children}</div>;

const Card = ({ href, title }: { href: string; title: string }) => (
  <DocLink className={styles.card} href={href}>
    {title}
  </DocLink>
);

const Steps = ({ children }: { children: ReactNode }) => <div className={styles.steps}>{children}</div>;

const getDoc = async (slug: string[]) => {
  const filePath = resolveDocPath(slug);
  if (!filePath) return null;

  const raw = readFileSync(filePath, 'utf8');
  const { content, data } = matter(raw);
  const normalizedContent = stripLeadingTitle(content);
  const headings = extractHeadings(normalizedContent);
  const renderedCounts = new Map<string, number>();

  const compiled = await compileMDX<Frontmatter>({
    components: {
      a: DocLink,
      Card,
      Cards,
      Callout,
      h2: createHeadingComponent(2, headings, renderedCounts),
      h3: createHeadingComponent(3, headings, renderedCounts),
      Steps,
    },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
      parseFrontmatter: false,
    },
    source: normalizedContent,
  });

  return {
    content: compiled.content,
    description: typeof data.description === 'string' ? data.description : '',
    headings,
    title: typeof data.title === 'string' ? data.title : slug.at(-1) || '文档',
  };
};

const flattenDocNav = () => DOC_NAV.flatMap((section) => section.items);

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { slug = [] } = await params;
  const doc = await getDoc(slug);

  if (!doc) {
    return {
      title: '文档未找到',
    };
  }

  return {
    description: doc.description,
    title: `${doc.title} · NaiYun AI`,
  };
};

const DocsPage = async ({ params }: PageProps) => {
  const { slug = [] } = await params;
  const doc = await getDoc(slug);
  const currentPath = `/docs/${slug.join('/')}`;
  const navItems = flattenDocNav();
  const currentIndex = navItems.findIndex((item) => item.href === currentPath);
  const previousDoc = currentIndex > 0 ? navItems[currentIndex - 1] : undefined;
  const nextDoc =
    currentIndex !== -1 && currentIndex < navItems.length - 1 ? navItems[currentIndex + 1] : undefined;

  if (!doc) {
    notFound();
  }

  return (
    <main className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarInner}>
            <span className={styles.sidebarEyebrow}>使用文档</span>
            {DOC_NAV.map((section) => (
              <section className={styles.sidebarSection} key={section.title}>
                <h2 className={styles.sidebarTitle}>{section.title}</h2>
                <nav className={styles.sidebarNav}>
                  {section.items.map((item) => {
                    const active = item.href === currentPath;

                    return (
                      <NextLink
                        aria-current={active ? 'page' : undefined}
                        className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ''}`}
                        href={item.href}
                        key={item.href}
                      >
                        {item.title}
                      </NextLink>
                    );
                  })}
                </nav>
              </section>
            ))}
          </div>
        </aside>

        <div className={styles.main}>
          <header className={styles.header}>
            <div className={styles.breadcrumbs}>
              <NextLink className={styles.breadcrumbLink} href="/docs/usage/enterprise/start">
                使用文档
              </NextLink>
              <span className={styles.breadcrumbDivider}>/</span>
              <span className={styles.breadcrumbCurrent}>企业员工手册</span>
            </div>
            <h1 className={styles.title}>{doc.title}</h1>
            {doc.description && <p className={styles.description}>{doc.description}</p>}
          </header>

          <article className={styles.article}>
            <div className={styles.content}>{doc.content}</div>
          </article>

          {(previousDoc || nextDoc) && (
            <nav className={styles.pager}>
              {previousDoc ? (
                <NextLink className={styles.pagerItem} href={previousDoc.href}>
                  <span className={styles.pagerLabel}>上一篇</span>
                  <strong>{previousDoc.title}</strong>
                </NextLink>
              ) : (
                <div />
              )}
              {nextDoc && (
                <NextLink className={`${styles.pagerItem} ${styles.pagerItemNext}`} href={nextDoc.href}>
                  <span className={styles.pagerLabel}>下一篇</span>
                  <strong>{nextDoc.title}</strong>
                </NextLink>
              )}
            </nav>
          )}
        </div>

        <aside className={styles.toc}>
          <div className={styles.tocInner}>
            <h2 className={styles.tocTitle}>本页目录</h2>
            <TocNav headings={doc.headings} />
          </div>
        </aside>
      </div>
    </main>
  );
};

export default DocsPage;
