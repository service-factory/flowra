import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface TeamInvitationEmailData {
  inviteeEmail: string;
  inviteeName?: string;
  teamName: string;
  inviterName: string;
  role: 'admin' | 'member' | 'viewer';
  inviteUrl: string;
  message?: string;
  expiresAt: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * 팀 초대 이메일을 발송합니다
 */
export async function sendTeamInvitationEmail(data: TeamInvitationEmailData): Promise<EmailSendResult> {
  try {
    console.log('📧 팀 초대 이메일 발송 시작:', {
      to: data.inviteeEmail,
      team: data.teamName,
      inviter: data.inviterName,
      role: data.role
    });


    const subject = `${data.teamName} 팀에 초대되었습니다`;
    
    const htmlContent = generateInvitationEmailHTML(data);
    const textContent = generateInvitationEmailText(data);

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
      to: data.inviteeEmail,
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.error('❌ 이메일 발송 실패:', result.error);
      return {
        success: false,
        error: result.error.message || '이메일 발송에 실패했습니다'
      };
    }

    console.log('✅ 이메일 발송 성공:', result.data?.id);
    return {
      success: true,
      messageId: result.data?.id
    };

  } catch (error) {
    console.error('❌ 이메일 발송 오류:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    };
  }
}

/**
 * 팀 초대 이메일 HTML 템플릿을 생성합니다
 */
function generateInvitationEmailHTML(data: TeamInvitationEmailData): string {
  const roleNames = {
    admin: '관리자',
    member: '멤버',
    viewer: '뷰어'
  };

  const expirationDate = new Date(data.expiresAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>팀 초대</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 16px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #1f2937;
        }
        .subtitle {
            font-size: 16px;
            color: #6b7280;
        }
        .content {
            margin-bottom: 32px;
        }
        .team-info {
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin: 24px 0;
            border-radius: 0 8px 8px 0;
        }
        .role-badge {
            display: inline-block;
            background-color: #dbeafe;
            color: #1d4ed8;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
        }
        .cta-button {
            display: block;
            width: 100%;
            max-width: 300px;
            margin: 32px auto;
            padding: 16px 24px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            text-align: center;
            font-weight: 600;
            font-size: 16px;
            transition: background-color 0.2s;
        }
        .cta-button:hover {
            background-color: #1d4ed8;
        }
        .message-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 24px 0;
        }
        .message-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 8px;
        }
        .expiry-notice {
            background-color: #fef2f2;
            border: 1px solid #fca5a5;
            border-radius: 8px;
            padding: 12px;
            margin: 24px 0;
            font-size: 14px;
            color: #991b1b;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Flowra</div>
            <h1 class="title">팀 초대</h1>
            <p class="subtitle">${data.inviterName}님이 팀에 초대했습니다</p>
        </div>

        <div class="content">
            <p>안녕하세요${data.inviteeName ? ` ${data.inviteeName}님` : ''},</p>
            
            <p><strong>${data.inviterName}</strong>님이 <strong>${data.teamName}</strong> 팀에 초대했습니다.</p>

            <div class="team-info">
                <h3 style="margin: 0 0 12px 0; color: #1f2937;">팀 정보</h3>
                <p style="margin: 8px 0;"><strong>팀 이름:</strong> ${data.teamName}</p>
                <p style="margin: 8px 0;"><strong>역할:</strong> <span class="role-badge">${roleNames[data.role]}</span></p>
                <p style="margin: 8px 0;"><strong>초대자:</strong> ${data.inviterName}</p>
            </div>

            ${data.message ? `
            <div class="message-box">
                <div class="message-title">초대 메시지</div>
                <p style="margin: 0;">${data.message}</p>
            </div>
            ` : ''}

            <a href="${data.inviteUrl}" class="cta-button">
                초대 수락하기
            </a>

            <div class="expiry-notice">
                ⚠️ 이 초대는 <strong>${expirationDate}</strong>까지 유효합니다.
            </div>

            <p>초대를 수락하면 ${data.teamName} 팀의 ${roleNames[data.role]} 권한으로 합류하게 됩니다.</p>
            
            <p>문의사항이 있으시면 ${data.inviterName}님에게 직접 연락하시거나 저희 고객지원팀으로 문의해 주세요.</p>
        </div>

        <div class="footer">
            <p>이 이메일은 Flowra 팀 관리 시스템에서 자동으로 발송되었습니다.</p>
            <p>© 2024 Flowra. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * 팀 초대 이메일 텍스트 템플릿을 생성합니다
 */
function generateInvitationEmailText(data: TeamInvitationEmailData): string {
  const roleNames = {
    admin: '관리자',
    member: '멤버',
    viewer: '뷰어'
  };

  const expirationDate = new Date(data.expiresAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
FLOWRA - 팀 초대

안녕하세요${data.inviteeName ? ` ${data.inviteeName}님` : ''},

${data.inviterName}님이 "${data.teamName}" 팀에 초대했습니다.

팀 정보:
- 팀 이름: ${data.teamName}
- 역할: ${roleNames[data.role]}
- 초대자: ${data.inviterName}

${data.message ? `
초대 메시지:
${data.message}
` : ''}

초대 수락하기: ${data.inviteUrl}

⚠️ 이 초대는 ${expirationDate}까지 유효합니다.

초대를 수락하면 ${data.teamName} 팀의 ${roleNames[data.role]} 권한으로 합류하게 됩니다.

문의사항이 있으시면 ${data.inviterName}님에게 직접 연락하시거나 저희 고객지원팀으로 문의해 주세요.

---
이 이메일은 Flowra 팀 관리 시스템에서 자동으로 발송되었습니다.
© 2024 Flowra. All rights reserved.
  `.trim();
}
