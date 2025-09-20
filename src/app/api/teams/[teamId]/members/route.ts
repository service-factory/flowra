import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// 팀원 초대 요청 스키마
const inviteMemberSchema = z.object({
  invitations: z.array(z.object({
    email: z.string().email('올바른 이메일 주소를 입력하세요'),
    role: z.enum(['admin', 'member', 'viewer']),
    message: z.string().optional(),
  })).min(1, '최소 1명 이상 초대해야 합니다'),
});

// 팀원 역할 변경 스키마
const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

// 팀원 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const resolvedParams = await params;
  const { teamId } = resolvedParams;
  
  try {
    const authResult = await authenticateWithTeam(request, teamId);
    if (!authResult.success) {
      console.error('❌ 팀 인증 실패:', authResult.error);
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        permissions,
        joined_at,
        is_active,
        users!team_members_user_id_fkey (
          id,
          email,
          name,
          avatar_url
        )
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (membersError) {
      console.error('❌ 팀원 목록 조회 실패:', {
        error: membersError,
        teamId,
        query: 'team_members with users'
      });
      return createErrorResponse('팀원 목록을 불러올 수 없습니다', 500);
    }

    // 팀원별 업무 통계 조회 (N+1 문제 해결을 위한 단일 쿼리)
    const memberIds = (members?.map(m => m.users?.id).filter(Boolean) || []) as string[];
    const { data: taskStats, error: statsError } = await supabase
      .from('tasks')
      .select('assignee_id, status')
      .eq('team_id', teamId)
      .in('assignee_id', memberIds);

    if (statsError) {
      console.error('⚠️ 업무 통계 조회 실패:', {
        error: statsError,
        memberIds: memberIds.length,
        teamId
      });
    }

    // 팀원별 업무 통계 계산
    const memberTaskStats = memberIds.reduce((acc, memberId) => {
      const memberTasks = taskStats?.filter(task => task.assignee_id === memberId) || [];
      acc[memberId] = {
        completed: memberTasks.filter(t => t.status === 'completed').length,
        current: memberTasks.filter(t => t.status === 'in_progress').length,
        overdue: memberTasks.filter(t => t.status === 'overdue').length,
      };
      return acc;
    }, {} as Record<string, { completed: number; current: number; overdue: number }>);

    // 대기 중인 초대 조회
    const { data: invitations, error: invitationsError } = await supabase
      .from('team_invitations')
      .select(`
        id,
        email,
        role,
        token,
        expires_at,
        accepted_at,
        created_at,
        users!team_invitations_invited_by_fkey (
          id,
          name,
          email
        )
      `)
      .eq('team_id', teamId)
      .is('accepted_at', null)
      .order('created_at', { ascending: false });

    if (invitationsError) {
      console.error('⚠️ 초대 목록 조회 실패:', invitationsError);
    }

    // 데이터 구조 최적화
    const optimizedMembers = (members || [])
      .filter(member => member.users) // null 체크
      .map(member => ({
      id: member.users!.id,
      name: member.users!.name,
      email: member.users!.email,
      avatar: member.users!.avatar_url,
      role: member.role,
      permissions: member.permissions,
      joinDate: member.joined_at,
      lastActive: null,
      isActive: member.is_active,
      taskStats: memberTaskStats[member.users!.id] || { completed: 0, current: 0, overdue: 0 },
      isInvitation: false,
    }));

    const optimizedInvitations = (invitations || []).map(invitation => {
      // 만료 여부 확인
      const now = new Date();
      const expiresAt = new Date(invitation.expires_at);
      const isExpired = now > expiresAt;
      const isAccepted = !!invitation.accepted_at;
      
      let status = 'pending';
      if (isAccepted) {
        status = 'accepted';
      } else if (isExpired) {
        status = 'expired';
      }
      
      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        message: '', // 기존 스키마에는 message 필드가 없음
        invitedBy: invitation.users?.name || '알 수 없음',
        invitedAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        status: status,
        isInvitation: true,
      };
    });

    return createSuccessResponse({
      members: optimizedMembers,
      invitations: optimizedInvitations,
      stats: {
        totalMembers: optimizedMembers.length,
        activeMembers: optimizedMembers.filter(m => m.isActive).length,
        adminCount: optimizedMembers.filter(m => m.role === 'admin').length,
        memberCount: optimizedMembers.filter(m => m.role === 'member').length,
        viewerCount: optimizedMembers.filter(m => m.role === 'viewer').length,
        pendingInvitations: optimizedInvitations.length,
      }
    });

  } catch (error) {
    console.error('🔴 팀원 목록 조회 API 오류:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      teamId,
      url: request.url
    });
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

// 팀원 초대
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  const resolvedParams = await params;
  const { teamId } = resolvedParams;
  
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

    // 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validationResult = inviteMemberSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('❌ 초대 데이터 검증 실패:', validationResult.error);
      return createErrorResponse(
        validationResult.error.issues[0]?.message || '올바른 초대 정보를 입력하세요',
        400
      );
    }

    const { invitations } = validationResult.data;

    // 팀 정보 조회 (이메일에서 사용)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('name, slug')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      console.error('❌ 팀 정보 조회 실패:', teamError);
      return createErrorResponse('팀 정보를 찾을 수 없습니다', 404);
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

    const results: any[] = [];
    
    for (const invitation of invitations) {
      try {
        // 이미 팀 멤버인지 확인 (이메일로 사용자 찾기)
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', invitation.email)
          .single();

        let existingMember: { id: string } | null = null;
        if (existingUser) {
          const { data: memberCheck } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', existingUser.id)
            .eq('is_active', true)
            .single();
          existingMember = memberCheck || null;
        }

        if (existingMember) {
          results.push({
            email: invitation.email,
            success: false,
            error: '이미 팀에 참여하고 있는 사용자입니다'
          });
          continue;
        }

        // 기존 대기중인 초대가 있는지 확인
        const { data: existingInvitation } = await supabase
          .from('team_invitations')
          .select('id, status')
          .eq('team_id', teamId)
          .eq('email', invitation.email)
          .eq('status', 'pending')
          .single();

        if (existingInvitation) {
          results.push({
            email: invitation.email,
            success: false,
            error: '이미 초대가 진행 중입니다'
          });
          continue;
        }

        // 초대 만료 시간 설정 (7일 후)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        // 초대 토큰 생성
        const inviteToken = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 팀 초대 생성
        const { data: newInvitation, error: invitationError } = await supabase
          .from('team_invitations')
          .insert({
            team_id: teamId,
            email: invitation.email,
            role: invitation.role,
            token: inviteToken,
            invited_by: user.id,
            expires_at: expiresAt.toISOString(),
          })
          .select('id')
          .single();

        if (invitationError || !newInvitation) {
          console.error('❌ 초대 생성 실패:', invitationError);
          results.push({
            email: invitation.email,
            success: false,
            error: '초대 생성에 실패했습니다'
          });
          continue;
        }

        // 초대 URL 생성
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const inviteUrl = `${baseUrl}/team/invite/${newInvitation.id}?token=${newInvitation.id}&email=${encodeURIComponent(invitation.email)}`;

        // 이메일 발송
        const { sendTeamInvitationEmail } = await import('@/lib/services/email/emailService');
        const emailResult = await sendTeamInvitationEmail({
          inviteeEmail: invitation.email,
          teamName: team.name,
          inviterName: inviter.name,
          role: invitation.role,
          inviteUrl,
          message: invitation.message,
          expiresAt: expiresAt.toISOString(),
        });

        if (!emailResult.success) {
          console.error('❌ 이메일 발송 실패:', emailResult.error);
          
          // 이메일 발송 실패 시 초대 레코드 삭제
          await supabase
            .from('team_invitations')
            .delete()
            .eq('id', newInvitation.id);

          results.push({
            email: invitation.email,
            success: false,
            error: `이메일 발송 실패: ${emailResult.error}`
          });
          continue;
        }

        results.push({
          email: invitation.email,
          success: true,
          invitationId: newInvitation.id,
          messageId: emailResult.messageId
        });

      } catch (error) {
        console.error('❌ 개별 초대 처리 실패:', error);
        results.push({
          email: invitation.email,
          success: false,
          error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    return createSuccessResponse({
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      },
      message: successCount > 0 
        ? `${successCount}명의 초대가 성공적으로 발송되었습니다`
        : '모든 초대 발송에 실패했습니다'
    });

  } catch (error) {
    console.error('🔴 팀원 초대 API 오류:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      teamId,
      url: request.url
    });
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

// 팀원 역할 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { teamId } = resolvedParams;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');

    if (!memberId) {
      return createErrorResponse('멤버 ID가 필요합니다', 400);
    }

    // 팀 인증 및 권한 확인 (멤버 관리 권한 필요)
    const authResult = await authenticateWithTeam(request, teamId, ['can_manage_members']);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validationResult = updateMemberRoleSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('올바른 역할을 선택하세요', 400);
    }

    const { role } = validationResult.data;

    // 자기 자신의 역할 변경 방지 (마지막 관리자인 경우)
    if (memberId === user.id && role !== 'admin') {
      const { data: adminCount } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamId)
        .eq('role', 'admin')
        .eq('is_active', true);

      if (adminCount && adminCount.length <= 1) {
        return createErrorResponse('팀에는 최소 1명의 관리자가 필요합니다', 400);
      }
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

    // 멤버 역할 업데이트
    const { data: updatedMember, error: updateError } = await supabase
      .from('team_members')
      .update({
        role,
        permissions: permissions[role],
        updated_at: new Date().toISOString(),
      })
      .eq('team_id', teamId)
      .eq('user_id', memberId)
      .eq('is_active', true)
      .select('id, role, permissions')
      .single();

    if (updateError) {
      console.error('멤버 역할 업데이트 실패:', updateError);
      return createErrorResponse('멤버 역할 변경에 실패했습니다', 500);
    }

    return createSuccessResponse({
      member: updatedMember,
      message: '멤버 역할이 성공적으로 변경되었습니다'
    });

  } catch (error) {
    console.error('멤버 역할 변경 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

// 팀원 제거 또는 초대 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const resolvedParams = await params;
    const { teamId } = resolvedParams;
    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');
    const invitationId = url.searchParams.get('invitationId');

    if (!memberId && !invitationId) {
      return createErrorResponse('멤버 ID 또는 초대 ID가 필요합니다', 400);
    }

    // 팀 인증 및 권한 확인 (멤버 관리 권한 필요)
    const authResult = await authenticateWithTeam(request, teamId, ['can_manage_members']);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    if (invitationId) {
      // 초대 취소 (초대 레코드 삭제)
      const { data: invitation, error: invitationError } = await supabase
        .from('team_invitations')
        .select('id, email, accepted_at')
        .eq('id', invitationId)
        .eq('team_id', teamId)
        .single();

      if (invitationError || !invitation) {
        return createErrorResponse('초대 정보를 찾을 수 없습니다', 404);
      }

      if (invitation.accepted_at) {
        return createErrorResponse('이미 수락된 초대는 취소할 수 없습니다', 400);
      }

      // 초대 레코드 삭제
      const { error: deleteError } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('team_id', teamId);

      if (deleteError) {
        console.error('초대 취소 실패:', deleteError);
        return createErrorResponse('초대 취소에 실패했습니다', 500);
      }

      return createSuccessResponse({ 
        message: `${invitation.email}에 대한 초대가 취소되었습니다`,
        email: invitation.email
      });
    }

    if (memberId) {
      // 자기 자신 제거 방지 (마지막 관리자인 경우)
      if (memberId === user.id) {
        const { data: adminCount } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamId)
          .eq('role', 'admin')
          .eq('is_active', true);

        if (adminCount && adminCount.length <= 1) {
          return createErrorResponse('팀에는 최소 1명의 관리자가 필요합니다', 400);
        }
      }

      // 멤버 비활성화 (실제 삭제하지 않고 is_active를 false로 설정)
      const { error: removeError } = await supabase
        .from('team_members')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('team_id', teamId)
        .eq('user_id', memberId)
        .eq('is_active', true);

      if (removeError) {
        console.error('멤버 제거 실패:', removeError);
        return createErrorResponse('멤버 제거에 실패했습니다', 500);
      }

      return createSuccessResponse({ message: '멤버가 팀에서 제거되었습니다' });
    }

  } catch (error) {
    console.error('멤버 제거/초대 취소 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
