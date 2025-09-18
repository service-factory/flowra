import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface UseTaskHandlersProps {
  refetch: () => void;
  tasks?: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function useTaskHandlers({ refetch, tasks = [] }: UseTaskHandlersProps) {
  const [selectedTask, setSelectedTask] = useState<any | null>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL에서 taskId 파라미터 읽기
  const taskId = searchParams.get('taskId');
  const isDrawerOpen = Boolean(taskId);

  // URL의 taskId가 변경될 때 selectedTask 업데이트
  useEffect(() => {
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
      } else {
        // taskId가 있지만 해당하는 task가 없으면 URL에서 제거
        const params = new URLSearchParams(searchParams.toString());
        params.delete('taskId');
        router.replace(`?${params.toString()}`);
      }
    } else if (!taskId) {
      setSelectedTask(null);
    }
  }, [taskId, tasks, searchParams, router]);

  const handleTaskCreate = () => {
    // React Query 캐시를 무효화하여 데이터를 다시 가져옴
    refetch();
  };

  const handleTaskMove = () => {
    // React Query 캐시를 무효화하여 데이터를 다시 가져옴
    refetch();
  };

  const handleTaskClick = useCallback((task: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const params = new URLSearchParams(searchParams.toString());
    params.set('taskId', task.id);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleTaskUpdate = useCallback(() => {
    // React Query 캐시를 무효화하여 데이터를 다시 가져옴
    refetch();
  }, [refetch]);

  const handleTaskDelete = useCallback(() => {
    // React Query 캐시를 무효화하여 데이터를 다시 가져옴
    refetch();
    // URL에서 taskId 제거
    const params = new URLSearchParams(searchParams.toString());
    params.delete('taskId');
    router.replace(`?${params.toString()}`);
  }, [refetch, searchParams, router]);

  const handleDrawerClose = useCallback(() => {
    // URL에서 taskId 제거
    const params = new URLSearchParams(searchParams.toString());
    params.delete('taskId');
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const handleRefresh = () => {
    refetch();
  };

  return {
    // 상태
    selectedTask,
    isDrawerOpen,
    
    // 핸들러
    handleTaskCreate,
    handleTaskMove,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    handleRefresh,
  };
}
