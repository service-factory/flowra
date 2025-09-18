import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse, hasPermission } from '@/lib/auth/middleware';
import { z } from 'zod';

const createProjectSchema = z.object({
  team_id: z.string().min(1, '팀 ID가 필요합니다'),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  color: z.string().optional(),
});

const updateProjectSchema = z.object({
  id: z.string().min(1),
  team_id: z.string().min(1),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  is_active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    
    if (!teamId) {
      return createErrorResponse('teamId가 필요합니다', 400);
    }

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, teamId);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 최적화된 프로젝트 조회 (필수 필드만, 태스크 개수 포함)
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id,
        name,
        description,
        color,
        created_at,
        updated_at,
        tasks!left(count)
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('프로젝트 조회 오류:', error);
      return createErrorResponse('프로젝트 조회에 실패했습니다', 500);
    }

    // 태스크 개수 포함한 응답 구조 최적화
    const optimizedProjects = (data || []).map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      color: project.color,
      created_at: project.created_at,
      updated_at: project.updated_at,
      task_count: project.tasks?.[0]?.count || 0
    }));

    return createSuccessResponse({ projects: optimizedProjects });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = createProjectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('입력 데이터가 올바르지 않습니다', 400);
    }
    
    const { team_id, name, description, color } = validationResult.data;

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase, membership } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 프로젝트 생성 권한 확인
    if (!hasPermission(membership!, 'can_manage_projects')) {
      return createErrorResponse('프로젝트 생성 권한이 없습니다', 403);
    }

    // 최적화된 프로젝트 생성 (필수 필드만 반환)
    const { data: project, error } = await supabase
      .from('projects')
      .insert({ 
        team_id, 
        name, 
        description: description || null, 
        color: color || '#3B82F6', 
        created_by: user!.id 
      })
      .select('id, name, description, color, created_at')
      .single();
    
    if (error) {
      console.error('프로젝트 생성 오류:', error);
      return createErrorResponse('프로젝트 생성에 실패했습니다', 500);
    }

    return createSuccessResponse(project, '프로젝트가 성공적으로 생성되었습니다');
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = updateProjectSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('입력 데이터가 올바르지 않습니다', 400);
    }
    
    const { id, team_id, ...updates } = validationResult.data;

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase, membership } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 프로젝트 수정 권한 확인
    if (!hasPermission(membership!, 'can_manage_projects')) {
      return createErrorResponse('프로젝트 수정 권한이 없습니다', 403);
    }

    const { data: project, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('team_id', team_id)
      .select('id, name, description, color, updated_at')
      .single();
    
    if (error) {
      console.error('프로젝트 수정 오류:', error);
      return createErrorResponse('프로젝트 수정에 실패했습니다', 500);
    }

    return createSuccessResponse(project, '프로젝트가 성공적으로 수정되었습니다');
  } catch (error) {
    console.error('PATCH /api/projects error:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, team_id } = body as { id?: string; team_id?: string };
    
    if (!id || !team_id) {
      return createErrorResponse('id, team_id가 필요합니다', 400);
    }

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase, membership } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 프로젝트 삭제 권한 확인
    if (!hasPermission(membership!, 'can_manage_projects')) {
      return createErrorResponse('프로젝트 삭제 권한이 없습니다', 403);
    }

    const { error } = await supabase
      .from('projects')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('team_id', team_id);
    
    if (error) {
      console.error('프로젝트 삭제 오류:', error);
      return createErrorResponse('프로젝트 삭제에 실패했습니다', 500);
    }

    return createSuccessResponse(null, '프로젝트가 성공적으로 삭제되었습니다');
  } catch (error) {
    console.error('DELETE /api/projects error:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}


