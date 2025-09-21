import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth/middleware';
import { createServiceClient } from '@/lib/supabase/server';
import { z } from 'zod';

const interactionSchema = z.object({
  taskId: z.string().min(1, '업무 ID가 필요합니다'),
  action: z.enum(['complete', 'extend', 'reschedule', 'view']),
  userId: z.string().min(1, '사용자 ID가 필요합니다'),
  teamId: z.string().min(1, '팀 ID가 필요합니다'),
  data: z.record(z.string(), z.unknown()).optional(), // 추가 데이터 (예: 연장 일수, 새 일정 등)
});

/**
 * GET /api/discord/interactions
 * 웹 링크를 통한 Discord 인터랙션 처리
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const teamId = searchParams.get('teamId');
    const days = searchParams.get('days');

    if (!taskId || !action || !userId || !teamId) {
      return new Response('필수 매개변수가 누락되었습니다.', { status: 400 });
    }

    const data = days ? { days: parseInt(days) } : undefined;
    
    // POST 방식과 동일한 로직 사용
    const mockRequest = new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ taskId, action, userId, teamId, data }),
      headers: { 'Content-Type': 'application/json' }
    });

    const response = await POST(mockRequest);
    const responseData = await response.json();

    // 웹 브라우저에서 보기 좋은 HTML 응답 반환
    if (responseData.success) {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Flowra - ${getActionTitle(action)}</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #2ecc71; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .message { font-size: 18px; margin-bottom: 20px; }
            .close { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">${getActionIcon(action)}</div>
            <div class="message success">${responseData.data.message}</div>
            <p>Discord로 돌아가서 확인해보세요!</p>
            <button class="close" onclick="window.close()">닫기</button>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    } else {
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Flowra - 오류</title>
          <meta charset="UTF-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .error { color: #e74c3c; }
            .icon { font-size: 48px; margin-bottom: 20px; }
            .message { font-size: 18px; margin-bottom: 20px; }
            .close { background: #e74c3c; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">❌</div>
            <div class="message error">${responseData.message || '오류가 발생했습니다.'}</div>
            <button class="close" onclick="window.close()">닫기</button>
          </div>
        </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

  } catch (error) {
    console.error('Discord 인터랙션 GET 오류:', error);
    return new Response('서버 오류가 발생했습니다.', { status: 500 });
  }
}

/**
 * POST /api/discord/interactions
 * Discord 인터랙션 버튼 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = interactionSchema.safeParse(body);
    
    if (!validationResult.success) {
      console.error('인터랙션 요청 검증 실패:', validationResult.error);
      return createErrorResponse(
        `잘못된 요청 데이터입니다: ${validationResult.error.issues.map(e => e.message).join(', ')}`,
        400
      );
    }

    const { taskId, action, userId, teamId, data } = validationResult.data;

    // Supabase 클라이언트 생성
    const supabase = createServiceClient();

    // 테스트 모드인지 확인 (taskId가 'test-task-123' 또는 숫자인 경우)
    const isTestMode = taskId === 'test-task-123' || /^\d+$/.test(taskId);
    
    let task;
    if (isTestMode) {
      // 테스트 모드: 더미 업무 데이터 생성
      task = {
        id: taskId,
        title: '테스트 업무',
        description: '개발 환경 테스트용 업무입니다.',
        status: 'in_progress',
        priority: 'medium',
        due_date: new Date().toISOString(),
        assignee_id: userId,
        team_id: teamId,
        assignee: { id: userId, name: '테스트 사용자', email: 'test@example.com' },
        project: { id: 'test-project', name: '테스트 프로젝트', color: '#3B82F6' },
        team: { id: teamId, name: '테스트 팀' }
      };
    } else {
      // 실제 모드: 데이터베이스에서 업무 정보 조회
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name, email),
          project:project_id(id, name, color),
          team:team_id(id, name)
        `)
        .eq('id', taskId)
        .eq('team_id', teamId)
        .single();

      if (taskError || !taskData) {
        return createErrorResponse('업무를 찾을 수 없습니다.', 404);
      }
      task = taskData;
    }

    // 테스트 모드가 아닌 경우에만 권한 확인
    if (!isTestMode) {
      // 권한 확인: 담당자이거나 팀 관리자인지 확인
      const { data: teamMember, error: memberError } = await supabase
        .from('team_members')
        .select('role, user_id')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .single();

      if (memberError || !teamMember) {
        return createErrorResponse('권한이 없습니다.', 403);
      }

      const isAssignee = task.assignee_id === userId;
      const isAdmin = teamMember.role === 'admin';

      if (!isAssignee && !isAdmin) {
        return createErrorResponse('이 업무를 관리할 권한이 없습니다.', 403);
      }
    }

    // 액션별 처리
    switch (action) {
      case 'complete':
        return await handleCompleteTask(supabase, task, userId, isTestMode);
      case 'extend':
        return await handleExtendTask(supabase, task, userId, data, isTestMode);
      case 'reschedule':
        return await handleRescheduleTask(supabase, task, userId, data, isTestMode);
      case 'view':
        return await handleViewTask(task);
      default:
        return createErrorResponse('지원하지 않는 액션입니다.', 400);
    }

  } catch (error) {
    console.error('Discord 인터랙션 처리 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

/**
 * 액션별 아이콘 반환
 */
function getActionIcon(action: string | null): string {
  switch (action) {
    case 'complete': return '✅';
    case 'extend': return '⏰';
    case 'view': return '📋';
    case 'reschedule': return '📅';
    default: return '🔧';
  }
}

/**
 * 액션별 제목 반환
 */
function getActionTitle(action: string | null): string {
  switch (action) {
    case 'complete': return '업무 완료';
    case 'extend': return '업무 연장';
    case 'view': return '상세보기';
    case 'reschedule': return '일정 변경';
    default: return '인터랙션';
  }
}

/**
 * 업무 완료 처리
 */
async function handleCompleteTask(supabase: any, task: any, userId: string, isTestMode: boolean = false) {
  try {
    if (isTestMode) {
      // 테스트 모드: 더미 응답 반환
      return createSuccessResponse({
        message: '테스트 모드: 업무가 완료되었습니다!',
        task: {
          id: task.id,
          title: task.title,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
        is_test_mode: true,
      });
    }

    // 실제 모드: 데이터베이스 업데이트
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      console.error('업무 완료 처리 오류:', error);
      return createErrorResponse('업무 완료 처리에 실패했습니다.', 500);
    }

    // 완료 알림 생성
    await supabase
      .from('notifications')
      .insert({
        user_id: task.assignee_id,
        type: 'task_completed',
        title: '업무 완료',
        content: `"${task.title}" 업무가 완료되었습니다.`,
        data: {
          task_id: task.id,
          completed_by: userId,
        },
      });

    return createSuccessResponse({
      message: '업무가 완료되었습니다!',
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        completed_at: updatedTask.completed_at,
      },
    });

  } catch (error) {
    console.error('업무 완료 처리 오류:', error);
    return createErrorResponse('업무 완료 처리에 실패했습니다.', 500);
  }
}

/**
 * 업무 연장 처리
 */
async function handleExtendTask(supabase: any, task: any, userId: string, data?: any, isTestMode: boolean = false) {
  try {
    // 연장 일수 (기본값: 1일)
    const extendDays = data?.days || 1;
    
    if (isTestMode) {
      // 테스트 모드: 더미 응답 반환
      const newDueDate = new Date(task.due_date);
      newDueDate.setDate(newDueDate.getDate() + extendDays);
      
      return createSuccessResponse({
        message: `테스트 모드: 업무가 ${extendDays}일 연장되었습니다!`,
        task: {
          id: task.id,
          title: task.title,
          due_date: newDueDate.toISOString(),
          extend_days: extendDays,
        },
        is_test_mode: true,
      });
    }

    // 실제 모드: 데이터베이스 업데이트
    // 현재 마감일에 연장 일수 추가
    const currentDueDate = new Date(task.due_date);
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + extendDays);

    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        due_date: newDueDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      console.error('업무 연장 처리 오류:', error);
      return createErrorResponse('업무 연장 처리에 실패했습니다.', 500);
    }

    // 연장 알림 생성
    await supabase
      .from('notifications')
      .insert({
        user_id: task.assignee_id,
        type: 'task_extended',
        title: '업무 연장',
        content: `"${task.title}" 업무가 ${extendDays}일 연장되었습니다.`,
        data: {
          task_id: task.id,
          extended_by: userId,
          extend_days: extendDays,
          new_due_date: newDueDate.toISOString(),
        },
      });

    return createSuccessResponse({
      message: `업무가 ${extendDays}일 연장되었습니다!`,
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        due_date: updatedTask.due_date,
        extend_days: extendDays,
      },
    });

  } catch (error) {
    console.error('업무 연장 처리 오류:', error);
    return createErrorResponse('업무 연장 처리에 실패했습니다.', 500);
  }
}

/**
 * 업무 일정 변경 처리
 */
async function handleRescheduleTask(supabase: any, task: any, userId: string, data?: any, isTestMode: boolean = false) {
  try {
    if (!data?.new_due_date) {
      return createErrorResponse('새로운 마감일이 필요합니다.', 400);
    }

    const newDueDate = new Date(data.new_due_date);

    if (isTestMode) {
      // 테스트 모드: 더미 응답 반환
      return createSuccessResponse({
        message: '테스트 모드: 업무 일정이 변경되었습니다!',
        task: {
          id: task.id,
          title: task.title,
          due_date: newDueDate.toISOString(),
          old_due_date: task.due_date,
        },
        is_test_mode: true,
      });
    }

    // 실제 모드: 데이터베이스 업데이트
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        due_date: newDueDate.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .select()
      .single();

    if (error) {
      console.error('업무 일정 변경 처리 오류:', error);
      return createErrorResponse('업무 일정 변경 처리에 실패했습니다.', 500);
    }

    // 일정 변경 알림 생성
    await supabase
      .from('notifications')
      .insert({
        user_id: task.assignee_id,
        type: 'task_rescheduled',
        title: '업무 일정 변경',
        content: `"${task.title}" 업무의 마감일이 변경되었습니다.`,
        data: {
          task_id: task.id,
          rescheduled_by: userId,
          old_due_date: task.due_date,
          new_due_date: newDueDate.toISOString(),
        },
      });

    return createSuccessResponse({
      message: '업무 일정이 변경되었습니다!',
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        due_date: updatedTask.due_date,
        old_due_date: task.due_date,
      },
    });

  } catch (error) {
    console.error('업무 일정 변경 처리 오류:', error);
    return createErrorResponse('업무 일정 변경 처리에 실패했습니다.', 500);
  }
}

/**
 * 업무 상세 정보 조회
 */
async function handleViewTask(task: any) {
  try {
    return createSuccessResponse({
      message: '업무 상세 정보',
      task: {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date,
        created_at: task.created_at,
        assignee: task.assignee ? {
          name: task.assignee.name,
          email: task.assignee.email,
        } : null,
        project: task.project ? {
          name: task.project.name,
          color: task.project.color,
        } : null,
      },
    });

  } catch (error) {
    console.error('업무 상세 조회 오류:', error);
    return createErrorResponse('업무 상세 조회에 실패했습니다.', 500);
  }
}
