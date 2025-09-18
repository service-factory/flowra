import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    // URL에서 teamId 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    if (!teamId) {
      return createErrorResponse('팀 ID가 필요합니다', 400);
    }

    // 인증 및 팀 권한 확인 (최적화된 단일 함수)
    const authResult = await authenticateWithTeam(request, teamId);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 병렬로 모든 데이터 조회 (성능 최적화 - 필수 필드만 선택)
    const [tasksResult, tagsResult, membersResult] = await Promise.all([
      // 팀의 업무 목록 조회 (필수 필드만)
      supabase
        .from('tasks')
        .select(`
          id,
          title,
          description,
          status,
          priority,
          due_date,
          position,
          created_at,
          updated_at,
          assignee:assignee_id(id, name, avatar_url),
          creator:creator_id(id, name, avatar_url),
          project:project_id(id, name, color)
        `)
        .eq('team_id', teamId)
        .order('position', { ascending: true })
        .limit(100), // 페이징 추가
      
      // 팀의 활성 태그만 조회
      supabase
        .from('team_tags')
        .select('id, name, color, usage_count')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('usage_count', { ascending: false })
        .limit(50),
      
      // 활성 팀 멤버만 조회 (필수 정보만)
      supabase
        .from('team_members')
        .select(`
          role,
          joined_at,
          user:user_id(id, name, avatar_url)
        `)
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true })
        .limit(20)
    ]);

    // 간소화된 오류 처리
    if (tasksResult.error || tagsResult.error || membersResult.error) {
      console.error('데이터 조회 오류:', {
        tasks: tasksResult.error,
        tags: tagsResult.error,
        members: membersResult.error
      });
      return createErrorResponse('데이터 조회에 실패했습니다', 500);
    }

    // 최적화된 응답 (불필요한 래핑 제거)
    return createSuccessResponse({
      tasks: tasksResult.data || [],
      tags: tagsResult.data || [],
      members: membersResult.data || []
    });

  } catch (error) {
    console.error('Tasks API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
