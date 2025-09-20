import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse, hasPermission } from '@/lib/auth/middleware';
import { z } from 'zod';

// 타입 정의
type TaskDependency = {
  depends_on_task_id: string;
  dependency_type?: string;
};

// 업무 생성 스키마 (db.md에 맞춤)
const createTaskSchema = z.object({
  team_id: z.string().min(1, '팀 ID가 필요합니다'),
  project_id: z.string().optional().nullable(),
  title: z.string().min(1, '업무 제목은 필수입니다').max(255, '제목은 255자를 초과할 수 없습니다'),
  description: z.string().optional().nullable(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignee_id: z.string().optional().nullable(),
  due_date: z.string().optional().nullable(),
  estimated_hours: z.number().min(0).max(999.99).optional().nullable(),
  position: z.number().int().min(0).default(0),
  metadata: z.object({
    tags: z.array(z.string()).optional(),
    dependencies: z.array(z.object({
      depends_on_task_id: z.string(),
      dependency_type: z.string().default('finish_to_start')
    })).optional()
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱 및 검증
    const body = await request.json();
    const validationResult = createTaskSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('입력 데이터가 올바르지 않습니다', 400);
    }

    const taskData = validationResult.data;

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, taskData.team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase, membership } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 업무 생성 권한 확인
    if (!hasPermission(membership!, 'can_manage_tasks')) {
      return createErrorResponse('업무 생성 권한이 없습니다', 403);
    }

    // 병렬로 유효성 검증 (성능 최적화)
    const validationPromises: any[] = [];
    
    if (taskData.project_id) {
      validationPromises.push(
        supabase
          .from('projects')
          .select('id')
          .eq('id', taskData.project_id)
          .eq('team_id', taskData.team_id)
          .single()
          .then(({ error }) => ({ type: 'project', error }))
      );
    }

    if (taskData.assignee_id) {
      validationPromises.push(
        supabase
          .from('team_members')
          .select('user_id')
          .eq('team_id', taskData.team_id)
          .eq('user_id', taskData.assignee_id)
          .eq('is_active', true)
          .single()
          .then(({ error }) => ({ type: 'assignee', error }))
      );
    }

    // 검증 결과 확인
    if (validationPromises.length > 0) {
      const validationResults = await Promise.all(validationPromises);
      const failedValidation = validationResults.find(result => result.error);
      
      if (failedValidation) {
        const errorMessage = failedValidation.type === 'project' 
          ? '유효하지 않은 프로젝트입니다'
          : '유효하지 않은 담당자입니다';
        return createErrorResponse(errorMessage, 400);
      }
    }

    // 최적화된 업무 생성 (필수 필드만 반환)
    const { data: newTask, error: taskError } = await supabase
      .from('tasks')
      .insert({
        team_id: taskData.team_id,
        project_id: taskData.project_id ?? null,
        title: taskData.title,
        description: taskData.description ?? null,
        status: taskData.status,
        priority: taskData.priority,
        assignee_id: taskData.assignee_id ?? null,
        creator_id: user!.id,
        due_date: taskData.due_date ?? null,
        estimated_hours: taskData.estimated_hours ?? null,
        position: taskData.position,
        metadata: taskData.metadata ?? {}
      })
      .select(`
        id,
        title,
        status,
        priority,
        due_date,
        created_at,
        assignee:assignee_id(id, name, avatar_url),
        creator:creator_id(id, name, avatar_url),
        project:project_id(id, name, color)
      `)
      .single();

    if (taskError) {
      console.error('업무 생성 오류:', taskError);
      return createErrorResponse('업무 생성에 실패했습니다', 500);
    }

    // 비동기로 추가 작업들 처리 (성능 최적화)
    const additionalTasks: any[] = [];

    // 태그 처리 (metadata에 tags가 있는 경우)
    if (taskData.metadata?.tags && Array.isArray(taskData.metadata.tags)) {
      const tagInserts = (taskData.metadata.tags as string[]).map((tag: string) => ({
        task_id: newTask.id,
        tag: tag,
        color: '#6B7280' // 기본 색상
      }));

      additionalTasks.push(
        supabase
          .from('task_tags')
          .insert(tagInserts)
          .then(({ error }) => {
            if (error) console.error('태그 생성 오류:', error);
          })
      );
    }

    // 의존성 처리 (metadata에 dependencies가 있는 경우)
    if (taskData.metadata?.dependencies && Array.isArray(taskData.metadata.dependencies)) {
      const dependencyInserts = (taskData.metadata.dependencies as TaskDependency[])
        .filter((dep) => dep.depends_on_task_id)
        .map((dep) => ({
          task_id: newTask.id,
          depends_on_task_id: dep.depends_on_task_id,
          dependency_type: dep.dependency_type || 'finish_to_start'
        }));

      if (dependencyInserts.length > 0) {
        additionalTasks.push(
          supabase
            .from('task_dependencies')
            .insert(dependencyInserts)
            .then(({ error }) => {
              if (error) console.error('의존성 생성 오류:', error);
            })
        );
      }
    }

    // 업무 히스토리 생성
    additionalTasks.push(
      supabase
        .from('task_history')
        .insert({
          task_id: newTask.id,
          user_id: user.id,
          action: 'created',
          comment: '업무가 생성되었습니다'
        })
        .then(({ error }) => {
          if (error) console.error('히스토리 생성 오류:', error);
        })
    );

    // 담당자에게 알림 생성 (담당자가 지정된 경우)
    if (taskData.assignee_id && taskData.assignee_id !== user.id) {
      additionalTasks.push(
        supabase
          .from('notifications')
          .insert({
            user_id: taskData.assignee_id,
            type: 'task_assigned',
            title: '새로운 업무가 할당되었습니다',
            content: `업무: ${taskData.title}`,
            data: {
              task_id: newTask.id,
              task_title: taskData.title,
              due_date: taskData.due_date,
              priority: taskData.priority
            }
          })
          .then(({ error }) => {
            if (error) console.error('알림 생성 오류:', error);
          })
      );
    }

    // 모든 추가 작업들을 병렬로 실행 (응답 시간 단축)
    if (additionalTasks.length > 0) {
      Promise.all(additionalTasks).catch(error => {
        console.error('추가 작업 처리 중 오류:', error);
      });
    }

    return createSuccessResponse(newTask, '업무가 성공적으로 생성되었습니다');

  } catch (error) {
    console.error('Task 생성 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
