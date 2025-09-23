import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';

// 초대 재전송
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; invitationId: string }> }
) {
  const resolvedParams = await params;
  const { teamId, invitationId } = resolvedParams;
  
  try {
    // 팀 인증 및 권한 확인 (멤버 관리 권한 필요)
    const authResult = await authenticateWithTeam(request, teamId, ['can_manage_members']);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 초대 정보 조회
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        accepted_at,
        teams (
          id,
          name,
          slug
        )
      `)
      .eq('id', invitationId)
      .eq('team_id', teamId)
      .single();

    if (invitationError || !invitation) {
      console.error('❌ 초대 정보 조회 실패:', invitationError);
      return createErrorResponse('초대 정보를 찾을 수 없습니다', 404);
    }

    // 초대 상태 확인
    if (invitation.accepted_at) {
      return createErrorResponse('이미 수락된 초대는 재발송할 수 없습니다', 400);
    }

    // 만료 확인
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      return createErrorResponse('만료된 초대입니다. 새로운 초대를 보내주세요', 400);
    }

    // 초대자 정보 조회
    const { data: inviter, error: inviterError } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    if (inviterError || !inviter) {
      console.error('❌ 초대자 정보 조회 실패:', inviterError);
      return createErrorResponse('초대자 정보를 찾을 수 없습니다', 404);
    }

    // 초대 URL 생성
    const { getAppBaseUrl } = await import('@/lib/utils');
    const baseUrl = getAppBaseUrl();
    const inviteUrl = `${baseUrl}/team/invite/${invitation.id}?token=${invitation.id}&email=${encodeURIComponent(invitation.email)}`;

    // 이메일 재발송
    const { sendTeamInvitationEmail } = await import('@/lib/services/email/emailService');
    const emailResult = await sendTeamInvitationEmail({
      inviteeEmail: invitation.email,
      teamName: invitation.teams?.name || '알 수 없는 팀',
      inviterName: inviter.name,
      role: invitation.role as 'admin' | 'member' | 'viewer',
      inviteUrl,
      message: '', // 기존 스키마에는 message 필드가 없음
      expiresAt: invitation.expires_at,
    });

    if (!emailResult.success) {
      console.error('❌ 이메일 재발송 실패:', emailResult.error);
      return createErrorResponse(`이메일 재발송 실패: ${emailResult.error}`, 500);
    }

    return createSuccessResponse({
      message: '초대 이메일이 재발송되었습니다',
      email: invitation.email,
      messageId: emailResult.messageId
    });

  } catch (error) {
    console.error('🔴 초대 재전송 API 오류:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      teamId,
      invitationId,
      url: request.url
    });
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
