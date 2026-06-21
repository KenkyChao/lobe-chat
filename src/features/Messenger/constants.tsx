import { Discord, Slack, Telegram } from '@lobehub/ui/icons';
import type { ReactNode } from 'react';

export type MessengerPlatform =
  | 'qq'
  | 'wechat'
  | 'feishu'
  | 'lark'
  | 'telegram'
  | 'slack'
  | 'discord';

const PlatformGlyph = ({ color, label, size }: { color: string; label: string; size: number }) => (
  <span
    style={{
      alignItems: 'center',
      background: color,
      borderRadius: 8,
      color: '#fff',
      display: 'inline-flex',
      fontSize: Math.max(10, Math.round(size * 0.35)),
      fontWeight: 700,
      height: size,
      justifyContent: 'center',
      lineHeight: 1,
      width: size,
    }}
  >
    {label}
  </span>
);

const PLATFORM_META: Record<
  Exclude<MessengerPlatform, 'telegram' | 'slack' | 'discord'>,
  { color: string; label: string }
> = {
  feishu: { color: '#3370ff', label: '飞' },
  lark: { color: '#00b96b', label: 'L' },
  qq: { color: '#12b7f5', label: 'QQ' },
  wechat: { color: '#07c160', label: '微' },
};

export const PLATFORM_TAB_ICONS: Record<MessengerPlatform, ReactNode> = {
  discord: <Discord.Color size={16} />,
  feishu: <PlatformGlyph {...PLATFORM_META.feishu} size={16} />,
  lark: <PlatformGlyph {...PLATFORM_META.lark} size={16} />,
  qq: <PlatformGlyph {...PLATFORM_META.qq} size={16} />,
  slack: <Slack.Color size={16} />,
  telegram: <Telegram.Color size={16} />,
  wechat: <PlatformGlyph {...PLATFORM_META.wechat} size={16} />,
};

export const PlatformAvatar = ({
  platform,
  size,
}: {
  platform: MessengerPlatform;
  size: number;
}) => {
  if (platform === 'telegram') return <Telegram.Avatar size={size} />;
  if (platform === 'discord') return <Discord.Avatar size={size} />;
  if (platform === 'slack') return <Slack.Avatar size={size} />;
  return <PlatformGlyph {...PLATFORM_META[platform]} size={size} />;
};

export const PlatformBrandIcon = ({
  platform,
  size,
}: {
  platform: MessengerPlatform;
  size: number;
}) => {
  if (platform === 'telegram') return <Telegram.Color size={size} />;
  if (platform === 'discord') return <Discord.Color size={size} />;
  if (platform === 'slack') return <Slack.Color size={size} />;
  return <PlatformGlyph {...PLATFORM_META[platform]} size={size} />;
};

export const buildTelegramBotUrl = (botUsername: string): string =>
  `https://t.me/${botUsername.replace(/^@/, '')}`;

export const buildTelegramDeepLink = (botUsername: string) =>
  `${buildTelegramBotUrl(botUsername)}?start=messenger`;

export const buildSlackOpenBotUrl = (tenantId: string, appId?: string): string =>
  appId
    ? `https://slack.com/app_redirect?app=${appId}&team=${tenantId}`
    : `https://app.slack.com/client/${tenantId}`;

export const buildDiscordOpenBotUrl = (applicationId: string): string =>
  `https://discord.com/users/${applicationId}`;
