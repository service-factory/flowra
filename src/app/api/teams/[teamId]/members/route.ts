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
  try {
    console.log('🔍 팀원 목록 API 호출:', { url: request.url, method: request.method });
    const resolvedParams = await params;
    console.log('📋 파라미터:', resolvedParams);
    const { teamId } = resolvedParams;
    
    // 팀 인증 및 권한 확인
    console.log('🔐 팀 인증 시작:', teamId);
    const authResult = await authenticateWithTeam(request, teamId);
    if (!authResult.success) {
      console.error('❌ 팀 인증 실패:', authResult.error);
      return authResult.error!;
    }
    console.log('✅ 팀 인증 성공');

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 팀원 정보 조회 (사용자 정보와 조인)
    console.log('📊 팀원 목록 조회 시작');
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
    console.log('✅ 팀원 목록 조회 성공:', members?.length || 0, '명');

    // 팀원별 업무 통계 조회 (N+1 문제 해결을 위한 단일 쿼리)
    const memberIds = members?.map(m => m.users.id) || [];
    console.log('📈 업무 통계 조회 시작:', memberIds.length, '명');
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
    } else {
      console.log('✅ 업무 통계 조회 성공:', taskStats?.length || 0, '개');
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

    // 대기 중인 초대 조회 (현재 team_invitations 테이블이 없으므로 빈 배열 반환)
    console.log('📧 초대 목록 조회 건너뛰기 (테이블 미구현)');
    const invitations: never[] = [];

    // 데이터 구조 최적화
    console.log('🔄 데이터 최적화 시작');
    const optimizedMembers = (members || []).map(member => ({
      id: member.users.id,
      name: member.users.name,
      email: member.users.email,
      avatar: member.users.avatar_url,
      role: member.role,
      permissions: member.permissions,
      joinDate: member.joined_at,
      lastActive: null,
      isActive: member.is_active,
      taskStats: memberTaskStats[member.users.id] || { completed: 0, current: 0, overdue: 0 },
      isInvitation: false,
    }));

    const optimizedInvitations = (invitations || []).map(invitation => ({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      message: invitation.message,
      invitedBy: invitation.users?.name || '알 수 없음',
      invitedAt: invitation.created_at,
      expiresAt: invitation.expires_at,
      status: invitation.status,
      isInvitation: true,
    }));

    console.log('✅ 데이터 최적화 완료:', {
      members: optimizedMembers.length,
      invitations: optimizedInvitations.length
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

// 팀원 초대 (현재 team_invitations 테이블이 없으므로 임시 비활성화)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    console.log('🔍 팀원 초대 API 호출 (임시 비활성화):', { url: request.url, method: request.method });
    
    return createErrorResponse('팀원 초대 기능은 현재 개발 중입니다', 501);

  } catch (error) {
    console.error('팀원 초대 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

// 팀원 역할 변경
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    console.log('🔍 팀원 역할 변경 API 호출:', { url: request.url, method: request.method });
    const resolvedParams = await params;
    console.log('📋 파라미터:', resolvedParams);
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
    console.log('🔍 팀원 제거/초대 취소 API 호출:', { url: request.url, method: request.method });
    const resolvedParams = await params;
    console.log('📋 파라미터:', resolvedParams);
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
      // 초대 취소 (현재 team_invitations 테이블이 없으므로 임시 비활성화)
      console.log('초대 취소 기능은 현재 개발 중입니다');
      return createErrorResponse('초대 취소 기능은 현재 개발 중입니다', 501);
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
