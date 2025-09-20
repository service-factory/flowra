import { useState } from 'react';
import { TaskStatus, Task } from '@/types';
import { apiRequest } from '@/lib/requests/customFetch';

interface OptimisticUpdate<T> {
  optimisticUpdate: (data: T) => void;
  revert: () => void;
}

export function useTaskActions(
  teamId?: string, 
  onOptimisticUpdate?: OptimisticUpdate<Task[]>
) {
  const [isLoading, setIsLoading] = useState(false);

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!teamId) {
      throw new Error('팀 ID가 필요합니다');
    }

    setIsLoading(true);
    try {
      const response = await apiRequest.delete({
        url: `/api/tasks/${taskId}`,
        body: { team_id: teamId }
      }) as any;

      if (!response.success) {
        throw new Error(response.error || '업무 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('업무 삭제 오류:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (
    taskId: string, 
    status: TaskStatus, 
    currentTasks?: Task[]
  ): Promise<Task | null> => {
    if (!teamId) {
      throw new Error('팀 ID가 필요합니다');
    }

    // 낙관적 업데이트
    let previousTasks: Task[] | null = null;
    if (currentTasks && onOptimisticUpdate) {
      previousTasks = [...currentTasks];
      const targetTask = currentTasks.find(task => task.id === taskId);
      
      if (targetTask) {
        const optimisticTasks = currentTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status, 
                updated_at: new Date().toISOString(),
                 completed_at: status === 'completed' ? new Date().toISOString() : undefined
              }
            : task
        );
        onOptimisticUpdate.optimisticUpdate(optimisticTasks);
      }
    }

    setIsLoading(true);
    try {
      const response = await apiRequest.patch({
        url: `/api/tasks/${taskId}`,
        body: {
          team_id: teamId,
          status
        }
      }) as any;

      if (!response.success) {
        console.error('❌ Status Update Failed:', response.error);
        // 실패 시 이전 상태로 되돌리기
        if (previousTasks && onOptimisticUpdate) {
          onOptimisticUpdate.revert();
        }
        throw new Error(response.error || '상태 변경에 실패했습니다');
      }
      return response.data as Task;
    } catch (error) {
      console.error('❌ Status Update Error:', error);
      // 실패 시 이전 상태로 되돌리기
      if (previousTasks && onOptimisticUpdate) {
        onOptimisticUpdate.revert();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const optimisticDeleteTask = async (
    taskId: string,
    currentTasks?: Task[]
  ): Promise<void> => {
    if (!teamId) {
      throw new Error('팀 ID가 필요합니다');
    }

    // 낙관적 업데이트
    let previousTasks: Task[] | null = null;
    if (currentTasks && onOptimisticUpdate) {
      previousTasks = [...currentTasks];
      const optimisticTasks = currentTasks.filter(task => task.id !== taskId);
      onOptimisticUpdate.optimisticUpdate(optimisticTasks);
    }

    setIsLoading(true);
    try {
      const response = await apiRequest.delete({
        url: `/api/tasks/${taskId}`,
        body: { team_id: teamId }
      }) as any;

      if (!response.success) {
        // 실패 시 이전 상태로 되돌리기
        if (previousTasks && onOptimisticUpdate) {
          onOptimisticUpdate.revert();
        }
        throw new Error(response.error || '업무 삭제에 실패했습니다');
      }
    } catch (error) {
      console.error('업무 삭제 오류:', error);
      // 실패 시 이전 상태로 되돌리기
      if (previousTasks && onOptimisticUpdate) {
        onOptimisticUpdate.revert();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteTask,
    updateTaskStatus,
    optimisticDeleteTask,
    isLoading
  };
}
