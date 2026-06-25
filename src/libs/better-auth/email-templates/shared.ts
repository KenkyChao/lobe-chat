import { BRANDING_LOGO_URL, BRANDING_NAME } from '@lobechat/business-const';

export const emailBrandName = BRANDING_NAME;

export const formatExpirationText = (seconds: number): string => {
  if (seconds >= 3600) {
    const hours = Math.round(seconds / 3600);
    return `${hours} 小时`;
  }

  if (seconds >= 60) {
    const minutes = Math.round(seconds / 60);
    return `${minutes} 分钟`;
  }

  return `${seconds} 秒`;
};

export const renderBrandHeader = () => `
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-flex; align-items: center; justify-content: center; background-color: #ffffff; border-radius: 12px; padding: 8px 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <img src="${BRANDING_LOGO_URL}" width="32" height="32" alt="${emailBrandName}" style="display: block; width: 32px; height: 32px; margin-right: 10px; border-radius: 8px;" />
        <span style="font-size: 18px; font-weight: 700; color: #000000; letter-spacing: 0;">${emailBrandName}</span>
      </div>
    </div>`;

export const renderFallbackLink = (url: string) => `
      <div style="text-align: center;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
          按钮无法点击？请复制以下链接到浏览器打开：
        </p>
        <a href="${url}" style="color: #2563eb; font-size: 13px; text-decoration: none; word-break: break-all; display: block; line-height: 1.4;">
          ${url}
        </a>
      </div>`;

export const renderCopyrightFooter = () => `
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
        © ${new Date().getFullYear()} ${emailBrandName}。保留所有权利。
      </p>
    </div>`;
