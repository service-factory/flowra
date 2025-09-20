import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// 초대 수락 요청 스키마
const acceptInvitationSchema = z.object({
  email: z.string().email('올바른 이메일 주소를 입력하세요'),
});

// 팀 초대 수락
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const resolvedParams = await params;
  const { invitationId } = resolvedParams;
  
  try {
    // 기본 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validationResult = acceptInvitationSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ 초대 수락 데이터 검증 실패:', validationResult.error);
      return createErrorResponse(
        validationResult.error.issues[0]?.message || '올바른 이메일을 입력하세요',
        400
      );
    }

    const { email } = validationResult.data;

    // 사용자 이메일과 초대 이메일이 일치하는지 확인
    if (user.email !== email) {
      return createErrorResponse('초대받은 이메일과 로그인한 계정이 일치하지 않습니다', 403);
    }

    // 초대 정보 조회 및 검증
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select(`
        id,
        team_id,
        email,
        role,
        expires_at,
        accepted_at,
        invited_by,
        created_at,
        teams (
          id,
          name,
          slug
        )
      `)
      .eq('id', invitationId)
      .eq('email', email)
      .single();

    if (invitationError || !invitation) {
      console.error('❌ 초대 정보 조회 실패:', invitationError);
      return createErrorResponse('초대 정보를 찾을 수 없습니다', 404);
    }

    // 초대 상태 검증 (accepted_at이 null인지 확인)
    if (invitation.accepted_at) {
      return createErrorResponse('이미 수락된 초대입니다', 400);
    }

    // 초대 만료 검증
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    if (now > expiresAt) {
      return createErrorResponse('초대가 만료되었습니다', 400);
    }

    // 이미 팀 멤버인지 확인
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', invitation.team_id!)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (existingMember) {
      // 초대를 수락됨으로 업데이트 (이미 멤버이므로)
      await supabase
        .from('team_invitations')
        .update({
          accepted_at: now.toISOString(),
        })
        .eq('id', invitationId);

      return createSuccessResponse({
        message: '이미 팀에 참여하고 있습니다',
        team: invitation.teams,
        redirectUrl: `/team/${invitation.teams?.slug || invitation.team_id}`
      });
    }

    // 역할에 따른 권한 설정
    const permissions = {
      admin: {
        can_manage_team: true,
        can_manage_members: true,
        can_manage_projects: true,
        can_manage_tasks: true,
        can_view_analytics: true,
      },
      member: {
        can_manage_team: false,
        can_manage_members: false,
        can_manage_projects: false,
        can_manage_tasks: true,
        can_view_analytics: false,
      },
      viewer: {
        can_manage_team: false,
        can_manage_members: false,
        can_manage_projects: false,
        can_manage_tasks: false,
        can_view_analytics: false,
      },
    };

    // 트랜잭션으로 팀 멤버 추가 및 초대 상태 업데이트
    const { data: newMember, error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: invitation.team_id,
        user_id: user.id,
        role: invitation.role,
        permissions: permissions[invitation.role],
        is_active: true,
        invited_by: invitation.invited_by,
        invited_at: invitation.created_at,
        joined_at: now.toISOString(),
      })
      .select('id, role')
      .single();

    if (memberError) {
      console.error('❌ 팀 멤버 추가 실패:', memberError);
      return createErrorResponse('팀 참여에 실패했습니다', 500);
    }

    // 초대 상태 업데이트
    const { error: updateError } = await supabase
      .from('team_invitations')
      .update({
        accepted_at: now.toISOString(),
      })
      .eq('id', invitationId);

    if (updateError) {
      console.error('❌ 초대 상태 업데이트 실패:', updateError);
      // 이미 멤버는 추가되었으므로 로그만 남기고 성공 처리
    }

    return createSuccessResponse({
      message: `${invitation.teams?.name || '알 수 없는 팀'} 팀에 성공적으로 참여했습니다`,
      member: {
        id: newMember.id,
        role: newMember.role,
        teamId: invitation.team_id,
        teamName: invitation.teams?.name || '알 수 없는 팀',
      },
      team: invitation.teams,
      redirectUrl: `/team/${invitation.teams?.slug || invitation.team_id}`
    });

  } catch (error) {
    console.error('🔴 팀 초대 수락 API 오류:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      invitationId,
      url: request.url
    });
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
