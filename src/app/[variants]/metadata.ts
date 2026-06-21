import { BRANDING_NAME, ORG_NAME } from '@lobechat/business-const';
import { OG_URL } from '@lobechat/const';

import { DEFAULT_LANG } from '@/const/locale';
import { OFFICIAL_URL } from '@/const/url';
import { isCustomORG } from '@/const/version';
import { translation } from '@/server/translation';
import { type DynamicLayoutProps } from '@/types/next';
import { RouteVariants } from '@/utils/server/routeVariants';

const faviconVersion = 3;
const naiyunhubIcon = `/icons/naiyunhub-logo.png?v=${faviconVersion}`;

export const generateMetadata = async (props: DynamicLayoutProps) => {
  const locale = await RouteVariants.getLocale(props);
  const { t } = await translation('metadata', locale);

  return {
    alternates: {
      canonical: OFFICIAL_URL,
    },
    appleWebApp: {
      statusBarStyle: 'black-translucent',
      title: BRANDING_NAME,
    },
    description: t('chat.description', { appName: BRANDING_NAME }),
    icons: {
      apple: `/apple-touch-icon.png?v=${faviconVersion}`,
      icon: [
        {
          sizes: '512x512',
          type: 'image/png',
          url: naiyunhubIcon,
        },
      ],
      shortcut: [
        {
          sizes: '512x512',
          type: 'image/png',
          url: naiyunhubIcon,
        },
      ],
    },
    manifest: '/manifest.json',
    metadataBase: new URL(OFFICIAL_URL),
    openGraph: {
      description: t('chat.description', { appName: BRANDING_NAME }),
      images: [
        {
          alt: t('chat.title', { appName: BRANDING_NAME }),
          height: 640,
          url: OG_URL,
          width: 1200,
        },
      ],
      locale: DEFAULT_LANG,
      siteName: BRANDING_NAME,
      title: BRANDING_NAME,
      type: 'website',
      url: OFFICIAL_URL,
    },
    title: {
      default: t('chat.title', { appName: BRANDING_NAME }),
      template: `%s · ${BRANDING_NAME}`,
    },
    twitter: {
      card: 'summary_large_image',
      description: t('chat.description', { appName: BRANDING_NAME }),
      images: [OG_URL],
      site: isCustomORG ? `@${ORG_NAME}` : '@lobehub',
      title: t('chat.title', { appName: BRANDING_NAME }),
    },
  };
};
