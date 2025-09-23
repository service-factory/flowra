import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTeamData } from '@/hooks/useTeamData';
import { useTaskFilters } from '@/hooks/useTaskFilters';
import { useViewMode } from '@/hooks/useViewMode';
import { useTaskHandlers } from '@/hooks/useTaskHandlers';
import { useTaskActions } from '@/hooks/useTaskActions';
import useAuth from '@/hooks/useAuth';
import { TaskCreateInitials, OptimisticUpdate } from '../types/tasks';
import { Task } from '@/types';

export const useTasksData = () => {
  const [showTagFilter] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [taskCreateInitials, setTaskCreateInitials] = useState<TaskCreateInitials>({});
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);

  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  
  const { currentTeam, refreshTeamData, user } = useAuth();
  
  const actualTeamId = useMemo(() => {
    if (teamId === '0' || !teamId) {
      return currentTeam?.id || null;
    }
    return teamId;
  }, [teamId, currentTeam?.id]);

  const { 
    data: teamData, 
    isLoading, 
    isFetching,
    refetch 
  } = useTeamData(actualTeamId);
  
  const tasks = useMemo(() => {
    const serverTasks = teamData?.tasks || [];
    return optimisticTasks.length > 0 ? optimisticTasks : serverTasks;
  }, [teamData?.tasks, optimisticTasks]);
  
  const teamMembers = useMemo(() => teamData?.members || [], [teamData?.members]);
  const projects = useMemo(() => teamData?.projects || [], [teamData?.projects]);

  const taskCreateModalProps = useMemo(() => ({
    teamId: actualTeamId || undefined,
    teamMembers,
    projects,
    isLoading
  }), [actualTeamId, teamMembers, projects, isLoading]);

  const {
    searchTerm,
    showCompleted,
    selectedTags,
    assigneeFilter,
    dueFilter,
    priorityFilter,
    allTags,
    filteredTasks: rawFilteredTasks,
    setSearchTerm,
    setShowCompleted,
    setAssigneeFilter,
    setDueFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
    clearAllQuickFilters,
  } = useTaskFilters({ 
    tasks, 
    currentUserEmail: user?.email 
  });

  const filteredTasks = rawFilteredTasks;

  const { viewMode, setViewMode } = useViewMode();

  const optimisticUpdate: OptimisticUpdate = useMemo(() => ({
    optimisticUpdate: (newTasks: any[]) => setOptimisticTasks(newTasks),
    revert: () => setOptimisticTasks([])
  }), []);

  const { optimisticDeleteTask, updateTaskStatus } = useTaskActions(
    actualTeamId || undefined,
    optimisticUpdate
  );

  const {
    selectedTask,
    isDrawerOpen,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    handleRefresh,
  } = useTaskHandlers({ refetch, tasks });

  const taskActionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOptimisticTaskMove = useCallback(async (taskId: string, newStatus: string) => {
    try {
      const serverTasks = teamData?.tasks || [];
      await updateTaskStatus(taskId, newStatus as any, serverTasks);
      
      if (taskActionTimeoutRef.current) {
        clearTimeout(taskActionTimeoutRef.current);
      }
      
      taskActionTimeoutRef.current = setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error('❌ Task move failed:', error);
    }
  }, [updateTaskStatus, teamData?.tasks, refetch]);

  const handleOptimisticTaskDelete = useCallback(async (taskId: string) => {
    try {
      const serverTasks = teamData?.tasks || [];
      await optimisticDeleteTask(taskId, serverTasks);
      
      if (taskActionTimeoutRef.current) {
        clearTimeout(taskActionTimeoutRef.current);
      }
      
      taskActionTimeoutRef.current = setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error('Task delete failed:', error);
    }
  }, [optimisticDeleteTask, teamData?.tasks, refetch]);

  const handleOptimisticStatusUpdate = useCallback(async (taskId: string, status: string) => {
    try {
      const serverTasks = teamData?.tasks || [];
      await updateTaskStatus(taskId, status as any, serverTasks);
      
      if (taskActionTimeoutRef.current) {
        clearTimeout(taskActionTimeoutRef.current);
      }
      
      taskActionTimeoutRef.current = setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  }, [updateTaskStatus, teamData?.tasks, refetch]);

  const openTaskCreateModal = useCallback((opts?: TaskCreateInitials) => {
    setTaskCreateInitials({ 
      initialStatus: opts?.initialStatus, 
      initialDueDate: opts?.initialDueDate 
    });
    setIsTaskCreateOpen(true);
  }, []);

  const isInitialLoading = isLoading && !teamData;
  const isRefreshing = Boolean(isFetching && teamData);

  useEffect(() => {
    return () => {
      if (taskActionTimeoutRef.current) {
        clearTimeout(taskActionTimeoutRef.current);
      }
    };
  }, []);

  return {
    showTagFilter,
    isTeamCreateModalOpen,
    isTaskCreateOpen,
    taskCreateInitials,
    actualTeamId,
    currentTeam,
    user,
    teamData,
    tasks,
    teamMembers,
    projects,
    filteredTasks,
    allTags,
    viewMode,
    selectedTask,
    isDrawerOpen,
    isInitialLoading,
    isRefreshing,
    taskCreateModalProps,
    searchTerm,
    showCompleted,
    selectedTags,
    assigneeFilter,
    dueFilter,
    priorityFilter,
    setSearchTerm,
    setShowCompleted,
    setAssigneeFilter,
    setDueFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
    clearAllQuickFilters,
    setViewMode,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    handleRefresh,
    handleOptimisticTaskMove,
    handleOptimisticTaskDelete,
    handleOptimisticStatusUpdate,
    openTaskCreateModal,
    setIsTaskCreateOpen,
    setIsTeamCreateModalOpen,
    refreshTeamData
  };
};
