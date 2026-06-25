import {
  emailBrandName,
  renderBrandHeader,
  renderCopyrightFooter,
  renderFallbackLink,
} from './shared';

export const getResetPasswordEmailTemplate = (params: { url: string }) => {
  const { url } = params;

  return {
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>重置密码</title>
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
          重置你的密码
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0; line-height: 1.5;">
          别担心，我们会帮你重新找回访问权限。
        </p>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        <p style="margin: 0 0 24px 0; text-align: center;">
          你正在为 ${emailBrandName} 账号重置密码。请点击下方按钮继续。
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}" target="_blank"
             style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 600; font-size: 16px; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            重置密码
          </a>
        </div>

        <!-- Security Note -->
        <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #f3f4f6;">
          <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center; line-height: 1.5;">
            🔒 如果这不是你本人操作，可以忽略此邮件；如有疑问，请联系管理员或支持人员。
          </p>
        </div>
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
    subject: `重置密码 - ${emailBrandName}`,
    text: `请点击链接重置密码：${url}`,
  };
};
