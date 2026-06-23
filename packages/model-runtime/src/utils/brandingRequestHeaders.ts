import { BRANDING_LOGO_URL, BRANDING_NAME, BRANDING_REFERER_URL } from '@lobechat/business-const';

export const BRANDING_REQUEST_HEADERS = {
  'HTTP-Referer': BRANDING_REFERER_URL,
  'X-Client': BRANDING_NAME,
  ...(BRANDING_LOGO_URL && { 'X-Logo': BRANDING_LOGO_URL }),
  'X-Title': BRANDING_NAME,
};

export const withBrandingRequestHeaders = (headers?: Record<string, any>) => ({
  ...BRANDING_REQUEST_HEADERS,
  ...headers,
});
