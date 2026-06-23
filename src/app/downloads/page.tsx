import type { Metadata } from 'next';

import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  description: 'Download NaiYunHub desktop apps for macOS and Windows.',
  title: '下载 NaiYunHub 桌面应用',
};

type DownloadItem = {
  description: string;
  fileType: string;
  platform: string;
  title: string;
  url?: string;
};

const env = (key: string) => process.env[key] || process.env[`NEXT_PUBLIC_${key}`];

const appVersion = env('DESKTOP_APP_VERSION');
const version = appVersion || '最新版';
const s3DownloadPrefix = env('DESKTOP_DOWNLOAD_S3_PREFIX') || 'desktop';

const joinUrl = (...parts: string[]) =>
  parts
    .filter(Boolean)
    .map((part, index) => {
      if (index === 0) return part.replaceAll(/\/+$/g, '');

      return part.replaceAll(/^\/+|\/+$/g, '');
    })
    .join('/');

const getS3DownloadUrl = (filename: string) => {
  const publicDomain = env('S3_PUBLIC_DOMAIN') || env('S3_ENDPOINT');
  const bucket = env('S3_BUCKET');

  if (!publicDomain || !bucket) return;

  return joinUrl(publicDomain, bucket, s3DownloadPrefix, filename);
};

const desktopDownloadUrl = (key: string, getFilename: (version: string) => string) => {
  const explicitUrl = env(key);
  if (explicitUrl) return explicitUrl;
  if (!appVersion) return;

  return getS3DownloadUrl(getFilename(appVersion));
};

const downloads: DownloadItem[] = [
  {
    description: '适用于 M 系列芯片 Mac',
    fileType: 'DMG',
    platform: 'macOS',
    title: 'macOS Apple Silicon',
    url: desktopDownloadUrl(
      'DESKTOP_DOWNLOAD_MAC_ARM64_URL',
      (version) => `NaiYunHub-${version}-arm64.dmg`,
    ),
  },
  {
    description: '适用于 Intel 芯片 Mac',
    fileType: 'DMG',
    platform: 'macOS',
    title: 'macOS Intel',
    url: desktopDownloadUrl(
      'DESKTOP_DOWNLOAD_MAC_X64_URL',
      (version) => `NaiYunHub-${version}-x64.dmg`,
    ),
  },
  {
    description: '适用于 Windows 10/11 64 位',
    fileType: 'EXE',
    platform: 'Windows',
    title: 'Windows x64',
    url: desktopDownloadUrl(
      'DESKTOP_DOWNLOAD_WINDOWS_X64_URL',
      (version) => `NaiYunHub-${version}-x64-setup.exe`,
    ),
  },
  {
    description: '适用于 Windows ARM 设备',
    fileType: 'EXE',
    platform: 'Windows',
    title: 'Windows ARM64',
    url: desktopDownloadUrl(
      'DESKTOP_DOWNLOAD_WINDOWS_ARM64_URL',
      (version) => `NaiYunHub-${version}-arm64-setup.exe`,
    ),
  },
];

const Page = () => {
  const hasDownloads = downloads.some(({ url }) => Boolean(url));

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <header className={styles.header}>
          <img alt="NaiYunHub" className={styles.logo} src="/icons/naiyunhub-logo.png" />
          <div>
            <p className={styles.eyebrow}>NaiYunHub Desktop</p>
            <h1>下载桌面应用</h1>
            <p className={styles.subtitle}>选择适合当前系统的安装包。当前版本：{version}</p>
          </div>
        </header>

        <div className={styles.grid}>
          {downloads.map((item) => {
            const available = Boolean(item.url);

            return (
              <article className={styles.item} key={item.title}>
                <div>
                  <p className={styles.platform}>{item.platform}</p>
                  <h2>{item.title}</h2>
                  <p className={styles.description}>{item.description}</p>
                </div>

                <div className={styles.actionRow}>
                  <span className={styles.fileType}>{item.fileType}</span>
                  <a
                    aria-disabled={!available}
                    className={available ? styles.button : styles.buttonDisabled}
                    href={item.url}
                    tabIndex={available ? undefined : -1}
                  >
                    {available ? '下载安装包' : '待配置'}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {!hasDownloads && (
          <p className={styles.empty}>安装包地址尚未配置，部署后会在这里显示可下载版本。</p>
        )}
      </section>
    </main>
  );
};

export default Page;
