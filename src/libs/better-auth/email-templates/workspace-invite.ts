import {
  emailBrandName,
  renderBrandHeader,
  renderFallbackLink,
} from './shared';

const roleLabelMap: Record<string, string> = {
  admin: '管理员',
  member: '成员',
  owner: '所有者',
  viewer: '查看者',
};

export const getWorkspaceInviteEmailTemplate = (params: {
  expiresInDays: number;
  inviterEmail?: string | null;
  inviterName?: string | null;
  role: string;
  url: string;
  workspaceName: string;
}) => {
  const { url, workspaceName, inviterName, inviterEmail, role, expiresInDays } = params;

  const inviterLabel = inviterName || inviterEmail || '一位协作者';
  const inviterByline =
    inviterEmail && inviterName ? `${inviterName} (${inviterEmail})` : inviterLabel;
  const subject = `${inviterLabel} 邀请你加入 ${workspaceName} - ${emailBrandName}`;
  const roleLabel = roleLabelMap[role] || role;
  const expirationText = `${expiresInDays} 天`;

  return {
    html: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #1a1a1a;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">

    <!-- Logo -->
    ${renderBrandHeader()}

    <!-- Card -->
    <div style="background: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 8px 30px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.02);">

      <!-- Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #111827; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; letter-spacing: 0;">
          加入 <strong>${workspaceName}</strong>
        </h1>
        <p style="color: #6b7280; font-size: 16px; margin: 0;">
          你被邀请以 <strong>${roleLabel}</strong> 身份加入工作区。
        </p>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        <p style="margin: 0 0 24px 0;">
          <strong>${inviterByline}</strong> 邀请你在 ${emailBrandName} 的
          <strong>${workspaceName}</strong> 工作区中协作。
        </p>

        <!-- Button -->
        <div style="text-align: center; margin: 36px 0;">
          <a href="${url}" target="_blank"
             style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 36px; border-radius: 14px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
            接受邀请
          </a>
        </div>

        <!-- Expiration Note -->
        <div style="background-color: #fffbeb; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #fde68a;">
          <p style="color: #92400e; font-size: 14px; margin: 0; text-align: center;">
            ⏰ 此邀请将在 <strong>${expirationText}</strong> 后失效。
          </p>
        </div>

        <p style="color: #6b7280; font-size: 15px; margin: 0;">
          如果你还没有 ${emailBrandName} 账号，系统会引导你完成注册后再加入工作区。
        </p>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

      <!-- Fallback Link -->
      ${renderFallbackLink(url)}
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px;">
      <p style="color: #a1a1aa; font-size: 13px; margin: 0;">
        如果你没有预期收到此邀请，可以忽略此邮件。
      </p>
    </div>
  </div>
</body>
</html>
    `,
    subject,
    text: `${inviterByline} 邀请你以 ${roleLabel} 身份加入 ${emailBrandName} 的「${workspaceName}」工作区。\n\n接受邀请：${url}\n\n此邀请将在 ${expirationText} 后失效。\n\n如果你没有预期收到此邀请，可以忽略此邮件。`,
  };
};
