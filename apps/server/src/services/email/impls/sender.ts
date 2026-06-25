import { BRANDING_NAME } from '@lobechat/business-const';

export const withBrandSender = (from?: string) => {
  if (!from || from.includes('<')) return from;

  return `${BRANDING_NAME} <${from}>`;
};
