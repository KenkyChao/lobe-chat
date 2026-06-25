import {
  emailBrandName,
  formatExpirationText,
  renderBrandHeader,
  renderCopyrightFooter,
  renderFallbackLink,
} from './shared';

export const getChangeEmailVerificationTemplate = (params: {
  expiresInSeconds: number;
  url: string;
  userName?: string | null;
}) => {
  const { url, userName, expiresInSeconds } = params;

  const expirationText = formatExpirationText(expiresInSeconds);

  return {
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>确认新的邮箱地址</title>
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
          确认新的邮箱地址
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">
          你正在修改 ${emailBrandName} 账号的邮箱。
        </p>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        ${userName ? `<p style="margin: 0 0 16px 0;">你好，<strong>${userName}</strong>：</p>` : ''}

        <p style="margin: 0 0 24px 0;">
          我们收到将你的 ${emailBrandName} 账号邮箱修改为当前地址的请求。请点击下方按钮完成确认。
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 36px 0;">
          <a href="${url}" target="_blank"
             style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 600; font-size: 16px; transition: transform 0.1s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            确认新的邮箱
          </a>
        </div>

        <!-- Expiration Note -->
        <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
            ⏰ 此链接将在 <strong>${expirationText}</strong> 后失效。
          </p>
        </div>

        <p style="color: #6b7280; font-size: 15px; margin: 0 0 8px 0;">
          如果这不是你本人操作，可以忽略此邮件。你的当前邮箱不会被修改。
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
    subject: `确认新的邮箱地址 - ${emailBrandName}`,
    text: `你正在修改 ${emailBrandName} 账号邮箱。请点击链接完成确认：${url}\n\n此链接将在 ${expirationText} 后失效。\n\n如果这不是你本人操作，可以忽略此邮件。`,
  };
};
