import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { createClient } from '@/lib/supabase/server';

// 팀 초대 정보 조회 (인증 불필요)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  const resolvedParams = await params;
  const { invitationId } = resolvedParams;
  
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return createErrorResponse('이메일이 필요합니다', 400);
    }

    // Supabase 클라이언트 생성 (서버사이드, 인증 불필요)
    const supabase = await createClient();

    // 초대 정보 조회
    const { data: invitation, error: invitationError } = await supabase
      .from('team_invitations')
      .select(`
        id,
        email,
        role,
        expires_at,
        accepted_at,
        created_at,
        teams (
          id,
          name,
          slug
        ),
        users!team_invitations_invited_by_fkey (
          name,
          email
        )
      `)
      .eq('id', invitationId)
      .eq('email', email)
      .single();

    if (invitationError || !invitation) {
      console.error('❌ 초대 정보 조회 실패:', invitationError);
      return createErrorResponse('초대 정보를 찾을 수 없습니다', 404);
    }

    // 초대 상태 확인
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);
    const isExpired = now > expiresAt;
    const isAccepted = !!invitation.accepted_at;
    
    let currentStatus = 'pending';
    if (isAccepted) {
      currentStatus = 'accepted';
    } else if (isExpired) {
      currentStatus = 'expired';
    }

    return createSuccessResponse({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      message: '', // 기존 스키마에는 message 필드가 없음
      status: currentStatus,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
      team: {
        id: invitation.teams?.id,
        name: invitation.teams?.name,
        slug: invitation.teams?.slug,
      },
      inviter: {
        name: invitation.users?.name || '알 수 없음',
        email: invitation.users?.email || '',
      }
    });

  } catch (error) {
    console.error('🔴 팀 초대 정보 조회 API 오류:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      invitationId,
      url: request.url
    });
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
