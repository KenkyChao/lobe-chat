import { BRANDING_LOGO_URL } from '@lobechat/business-const';
import type { MetaData } from '@lobechat/types';

export const DEFAULT_AVATAR = '/avatars/agent-default.png';
export const DEFAULT_USER_AVATAR = '😀';
export const DEFAULT_SUPERVISOR_AVATAR = '🎙️';
export const DEFAULT_SUPERVISOR_ID = 'supervisor';
export const DEFAULT_BACKGROUND_COLOR = undefined;
export const DEFAULT_AGENT_META: MetaData = {};
export const DEFAULT_INBOX_AVATAR = BRANDING_LOGO_URL || '/avatars/lobe-ai.png';
export const DEFAULT_USER_AVATAR_URL = BRANDING_LOGO_URL || '/icons/icon-192x192.png';

export const DEFAULT_INBOX_TITLE = 'NaiYun AI';
export const DEFAULT_INBOX_LEGACY_TITLE = 'Lobe AI';
export const DEFAULT_INBOX_LEGACY_AVATAR = '/avatars/lobe-ai.png';

export const resolveDefaultInboxTitle = (title?: string | null) =>
  !title || title === DEFAULT_INBOX_LEGACY_TITLE ? DEFAULT_INBOX_TITLE : title;

export const resolveDefaultInboxAvatar = (avatar?: string | null) =>
  !avatar || avatar === DEFAULT_INBOX_LEGACY_AVATAR ? DEFAULT_INBOX_AVATAR : avatar;
