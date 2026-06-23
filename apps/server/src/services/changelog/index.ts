import { readFile } from 'node:fs/promises';
import nodePath from 'node:path';

import dayjs from 'dayjs';
import { template } from 'es-toolkit/compat';
import matter from 'gray-matter';
import semver from 'semver';
import urlJoin from 'url-join';

import { FetchCacheTag } from '@/const/cacheControl';
import { type Locales } from '@/locales/resources';
import { type ChangelogIndexItem } from '@/types/changelog';
import { markdownToTxt } from '@/utils/markdownToTxt';

const URL_TEMPLATE = 'https://raw.githubusercontent.com/{{user}}/{{repo}}/{{branch}}/{{path}}';
const LAST_MODIFIED = new Date().toISOString();

const docCdnPrefix = process.env.DOC_S3_PUBLIC_DOMAIN || '';

export interface ChangelogConfig {
  branch: string;
  cdnPath: string;
  changelogPath: string;
  docsPath: string;
  majorVersion: number;
  repo: string;
  source: 'local' | 'remote';
  type: 'cloud' | 'community';
  urlTemplate: string;
  user: string;
}

export class ChangelogService {
  cdnUrls: {
    [key: string]: string;
  } = {};
  config: ChangelogConfig = {
    branch: process.env.DOCS_BRANCH || 'main',
    cdnPath: 'docs/.cdn.cache.json',
    changelogPath: 'changelog',
    docsPath: 'docs/changelog',
    majorVersion: 1,
    repo: 'lobe-chat',
    source: process.env.CHANGELOG_SOURCE === 'remote' ? 'remote' : 'local',
    type: 'cloud',
    urlTemplate: process.env.CHANGELOG_URL_TEMPLATE || URL_TEMPLATE,
    user: 'lobehub',
  };

  async getLatestChangelogId() {
    const index = await this.getChangelogIndex();
    return index[0]?.id;
  }

  async getChangelogIndex(limit = 5): Promise<ChangelogIndexItem[]> {
    try {
      const data = await this.getSourceJson<{
        cloud: ChangelogIndexItem[];
        community: ChangelogIndexItem[];
      }>(urlJoin(this.config.docsPath, 'index.json'));

      return this.mergeChangelogs(data.cloud, data.community).slice(0, limit);
    } catch (e) {
      const cause = (e as Error).cause as { code: string };
      if (cause?.code?.includes('ETIMEDOUT')) {
        console.warn(
          '[ChangelogFetchTimeout] fail to fetch changelog lists due to network timeout. Please check your network connection.',
        );
      } else {
        console.error('Error getting changelog lists:', e);
      }

      return [];
    }
  }

  async getIndexItemById(id: string) {
    const index = await this.getChangelogIndex(Number.POSITIVE_INFINITY);
    return index.find((item) => item.id === id);
  }

  async getPostById(id: string, options?: { locale?: Locales }) {
    await this.cdnInit();
    try {
      const post = await this.getIndexItemById(id);

      const filename = options?.locale?.startsWith('zh') ? `${id}.zh-CN.mdx` : `${id}.mdx`;
      const text = await this.getSourceText(urlJoin(this.config.docsPath, filename));
      const { data, content } = matter(text);

      const regex = /^#\s(.+)/;
      const match = regex.exec(content.trim());
      const matches = content.trim().split(regex);

      let description: string;

      if (matches[2]) {
        description = matches[2] ? matches[2].trim() : '';
      } else {
        description = matches[1] ? matches[1].trim() : '';
      }

      if (docCdnPrefix) {
        const images = this.extractHttpsLinks(content);
        for (const url of images) {
          const cdnUrl = this.replaceCdnUrl(url);
          if (cdnUrl && url !== cdnUrl) {
            description = description.replaceAll(url, cdnUrl);
          }
        }
      }

      return {
        date: post?.date
          ? new Date(post.date)
          : data?.date
            ? new Date(data.date)
            : new Date(LAST_MODIFIED),
        description: markdownToTxt(description.replaceAll('\n', '').replaceAll('  ', ' ')).slice(
          0,
          160,
        ),
        image: post?.image ? this.replaceCdnUrl(post.image) : undefined,
        tags: ['changelog'],
        title: match ? match[1] : '',
        ...data,
        content: description,
        rawTitle: match ? match[1] : '',
      };
    } catch (e) {
      console.error('[ChangelogFetchError]failed to fetch changlog post', id);
      console.error(e);

      return false as any;
    }
  }

  private mergeChangelogs(
    cloud: ChangelogIndexItem[],
    community: ChangelogIndexItem[],
  ): ChangelogIndexItem[] {
    if (this.config.type === 'community') {
      return community;
    }

    const merged = [...community];

    for (const cloudItem of cloud) {
      const index = merged.findIndex((item) => item.id === cloudItem.id);
      if (index !== -1) {
        merged[index] = cloudItem;
      } else {
        merged.push(cloudItem);
      }
    }

    return merged
      .map((item) => ({
        ...item,
        date: dayjs(item.date).format('YYYY-MM-DD'),
        versionRange: this.formatVersionRange(item.versionRange),
      }))
      .sort((a, b) =>
        semver.rcompare(
          this.toSortableVersion(a.versionRange[0]),
          this.toSortableVersion(b.versionRange[0]),
        ),
      );
  }

  private formatVersionRange(range: string[]): string[] {
    if (range.length === 1) {
      return range;
    }

    const [v1, v2] = range;
    const sortableV1 = this.toSortableVersion(v1);
    const sortableV2 = this.toSortableVersion(v2);

    const minVersion = semver.lt(sortableV1, sortableV2) ? v1 : v2;
    const maxVersion = semver.gt(sortableV1, sortableV2) ? v1 : v2;

    return [minVersion, maxVersion];
  }

  private toSortableVersion(version: string) {
    const validVersion = semver.valid(version);
    if (validVersion) return validVersion;

    const fourPartVersion = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(version);
    if (fourPartVersion) {
      const [, major, minor, patch, build] = fourPartVersion;
      return `${major}.${minor}.${patch}-${build}`;
    }

    return semver.coerce(version)?.version || '0.0.0';
  }

  private genUrl(path: string) {
    // Custom delimiter set to {{}}
    const compiledTemplate = template(this.config.urlTemplate, {
      interpolate: /\{\{([\s\S]+?)\}\}/g,
    });

    return compiledTemplate({ ...this.config, path });
  }

  private getLocalPath(path: string) {
    return nodePath.join(process.cwd(), path);
  }

  private async getSourceText(path: string) {
    if (this.config.source === 'local') {
      return await readFile(this.getLocalPath(path), 'utf8');
    }

    const response = await fetch(this.genUrl(path), {
      next: { revalidate: 3600, tags: [FetchCacheTag.Changelog] },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch changelog source: ${response.status}`);
    }

    return await response.text();
  }

  private async getSourceJson<T>(path: string): Promise<T> {
    if (this.config.source === 'local') {
      const text = await readFile(this.getLocalPath(path), 'utf8');
      return JSON.parse(text) as T;
    }

    const response = await fetch(this.genUrl(path), {
      next: { revalidate: 3600, tags: [FetchCacheTag.Changelog] },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch changelog source: ${response.status}`);
    }

    return (await response.json()) as T;
  }

  private extractHttpsLinks(text: string) {
    const regex = /https:\/\/[^\s"')>]+/g;
    const links = text.match(regex);
    return links || [];
  }

  private async cdnInit() {
    if (!docCdnPrefix) return;
    if (Object.keys(this.cdnUrls).length === 0) {
      try {
        const data = await this.getSourceJson<Record<string, string>>(this.config.cdnPath);
        if (data) {
          this.cdnUrls = data;
        }
      } catch (error) {
        console.error('Error getting changelog cdn cache:', error);
      }
    }
  }

  private replaceCdnUrl(url: string) {
    if (url?.startsWith('/blog')) return urlJoin('https://hub-apac-1.lobeobjects.space/', url);
    return url;
  }
}
