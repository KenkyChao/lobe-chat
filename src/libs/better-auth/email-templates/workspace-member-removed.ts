import { emailBrandName, renderBrandHeader, renderCopyrightFooter } from './shared';

export const getWorkspaceMemberRemovedEmailTemplate = (params: {
  reason: 'downgrade' | 'removed_by_owner';
  workspaceName: string;
}) => {
  const { workspaceName, reason } = params;

  const isDowngrade = reason === 'downgrade';

  const subject = `你已从 ${workspaceName} 工作区移除 - ${emailBrandName}`;

  const heading = `已从 <strong>${workspaceName}</strong> 移除`;

  const body = isDowngrade
    ? `工作区 <strong>${workspaceName}</strong> 已降级，因此所有团队成员都已被移除。你的个人数据和其他工作区不会受到影响。`
    : `<strong>${workspaceName}</strong> 的所有者已将你从该工作区移除。你的个人数据和其他工作区不会受到影响。`;

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
          ${heading}
        </h1>
      </div>

      <!-- Content -->
      <div style="color: #374151; font-size: 16px; line-height: 1.6;">
        <p style="margin: 0 0 24px 0;">
          ${body}
        </p>

        <!-- Info Note -->
        <div style="background-color: #f0f9ff; border-radius: 12px; padding: 16px; margin-bottom: 24px; border: 1px solid #bae6fd;">
          <p style="color: #0c4a6e; font-size: 14px; margin: 0; text-align: center;">
            如果你认为这是误操作，请联系工作区所有者。
          </p>
        </div>
      </div>

      <!-- Divider -->
      <div style="border-top: 1px solid #e5e7eb; margin: 32px 0;"></div>

      <!-- Footer note -->
      <div style="text-align: center;">
        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
          你仍然可以继续使用 ${emailBrandName} 的个人工作区。
        </p>
      </div>
    </div>

    <!-- Footer -->
    ${renderCopyrightFooter()}
  </div>
</body>
</html>
    `,
    subject,
    text: isDowngrade
      ? `工作区「${workspaceName}」已降级，因此所有团队成员都已被移除。你的个人数据和其他工作区不会受到影响。如有疑问，请联系工作区所有者。`
      : `「${workspaceName}」的所有者已将你从该工作区移除。你的个人数据和其他工作区不会受到影响。如有疑问，请联系工作区所有者。`,
  };
};
