import {
  emailBrandName,
  formatExpirationText,
  renderBrandHeader,
  renderCopyrightFooter,
  renderFallbackLink,
} from './shared';

export const getMagicLinkEmailTemplate = (params: { expiresInSeconds: number; url: string }) => {
  const { url, expiresInSeconds } = params;

  const expirationText = formatExpirationText(expiresInSeconds);

  return {
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>登录 ${emailBrandName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #1a1a1a;">
  <!-- Container -->
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Logo -->
    ${renderBrandHeader()}

    <!-- Card -->
    <div style="background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: 0;">
          登录 ${emailBrandName}
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">
          点击下方按钮即可继续登录你的账号。
        </p>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        
        <!-- Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}" target="_blank"
             style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 600; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            继续登录
          </a>
        </div>

        <!-- Expiration Note -->
        <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center; line-height: 1.5;">
            ⏰ 此链接将在 <strong>${expirationText}</strong> 后失效。
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0; text-align: center;">
          如果这不是你本人操作，可以忽略此邮件。
        </p>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

      <!-- Fallback Link -->
      ${renderFallbackLink(url)}
    </div>

    <!-- Footer -->
    ${renderCopyrightFooter()}
  </div>
</body>
</html>
    `,
    subject: `${emailBrandName} 登录链接`,
    text: `请使用此链接登录：${url}\n\n此链接将在 ${expirationText} 后失效。`,
  };
};
