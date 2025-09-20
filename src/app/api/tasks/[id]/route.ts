import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { notificationService } from '@/lib/services/notifications/notificationService';
import { taskUpdateSchema, taskStatusUpdateSchema } from '@/lib/validation/schemas';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { team_id, ...updateData } = body;

    if (!team_id) {
      return createErrorResponse('팀 ID가 필요합니다', 400);
    }

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 업무가 해당 팀에 속하는지 확인
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id, team_id')
      .eq('id', taskId)
      .eq('team_id', team_id)
      .single();

    if (fetchError || !existingTask) {
      return createErrorResponse('업무를 찾을 수 없습니다', 404);
    }

    // 상태 업데이트인지 일반 업데이트인지 확인
    let validatedData;
    if ('status' in updateData && Object.keys(updateData).length <= 2) {
      // 상태 업데이트
      const validation = taskStatusUpdateSchema.safeParse(updateData);
      if (!validation.success) {
        return createErrorResponse('유효하지 않은 상태 데이터입니다', 400);
      }
      validatedData = validation.data;
    } else {
      // 일반 업데이트
      const validation = taskUpdateSchema.safeParse(updateData);
      if (!validation.success) {
        return createErrorResponse('유효하지 않은 업무 데이터입니다', 400);
      }
      validatedData = validation.data;
    }

    // 완료 시간 자동 설정
    if (validatedData.status === 'completed' && !validatedData.completed_at) {
      validatedData.completed_at = new Date().toISOString();
    } else if (validatedData.status !== 'completed') {
      validatedData.completed_at = null;
    }

    // 업무 업데이트
    const { data: updatedTask, error: updateError } = await supabase
      .from('tasks')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('team_id', team_id)
      .select(`
        id,
        title,
        description,
        status,
        priority,
        due_date,
        completed_at,
        position,
        created_at,
        updated_at,
        assignee:assignee_id(id, name, avatar_url),
        creator:creator_id(id, name, avatar_url),
        project:project_id(id, name, color)
      `)
      .single();

    if (updateError) {
      console.error('업무 업데이트 오류:', updateError);
      return createErrorResponse('업무 업데이트에 실패했습니다', 500);
    }

    // 업데이트 후 알림 생성 (비동기)
    Promise.resolve().then(async () => {
      try {
        const { user } = authResult;
        if (!user || !updatedTask) return;

        // 담당자 변경 알림
        if ('assignee_id' in validatedData && validatedData.assignee_id && 
            validatedData.assignee_id !== user.id) {
          await notificationService.createTaskAssignedNotification(
            validatedData.assignee_id,
            {
              taskId: updatedTask.id,
              taskTitle: updatedTask.title,
              assignerName: user.name || user.email || '알 수 없음',
              projectName: updatedTask.project?.name,
              teamName: '현재 팀',
            }
          );
        }

        // 태스크 완료 알림
        if ('status' in validatedData && validatedData.status === 'completed' && 
            updatedTask.assignee && (updatedTask.assignee as any).id !== user.id) {
          await notificationService.createTaskCompletedNotification(
            (updatedTask.assignee as any).id,
            {
              taskId: updatedTask.id,
              taskTitle: updatedTask.title,
              projectName: (updatedTask.project as any)?.name,
              teamName: '현재 팀',
            }
          );
        }

        // 마감일 변경 알림 (마감일이 임박한 경우)
        if ('due_date' in validatedData && validatedData.due_date && 
            updatedTask.assignee && (updatedTask.assignee as any).id !== user.id) {
          const dueDate = new Date(validatedData.due_date);
          const now = new Date();
          const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursUntilDue <= 24 && hoursUntilDue > 0) {
            await notificationService.createTaskDueNotification(
              (updatedTask.assignee as any).id,
              {
                taskId: updatedTask.id,
                taskTitle: updatedTask.title,
                dueDate: validatedData.due_date,
                projectName: (updatedTask.project as any)?.name,
                teamName: '현재 팀',
              }
            );
          }
        }
      } catch (error) {
        console.error('알림 생성 오류:', error);
      }
    });

    return createSuccessResponse(updatedTask, '업무가 성공적으로 업데이트되었습니다');
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const body = await request.json();
    const { team_id } = body;

    if (!team_id) {
      return createErrorResponse('팀 ID가 필요합니다', 400);
    }

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    // 업무가 해당 팀에 속하는지 확인
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('id, team_id, title')
      .eq('id', taskId)
      .eq('team_id', team_id)
      .single();

    if (fetchError || !existingTask) {
      return createErrorResponse('업무를 찾을 수 없습니다', 404);
    }

    // 관련 데이터 삭제 (트랜잭션 방식)
    const { error: deleteError } = await (supabase as any).rpc('delete_task_with_relations', {
      task_id: taskId,
      team_id: team_id
    });

    if (deleteError) {
      console.error('업무 삭제 오류:', deleteError);
      
      // RPC가 없는 경우 개별 삭제
      const { error: directDeleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('team_id', team_id);

      if (directDeleteError) {
        return createErrorResponse('업무 삭제에 실패했습니다', 500);
      }
    }

    return createSuccessResponse(
      { id: taskId, title: existingTask.title }, 
      '업무가 성공적으로 삭제되었습니다'
    );
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
