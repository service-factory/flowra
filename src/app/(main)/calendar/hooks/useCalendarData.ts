import { useState, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTeamData } from '@/hooks/useTeamData';
import { useTaskHandlers } from '@/hooks/useTaskHandlers';
import { useAuth } from '@/hooks/useAuth';
import { ViewMode, TaskCreateInitials } from '../types/calendar';
import { groupTasksByDate } from '../utils/calendarUtils';

export const useCalendarData = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [taskCreateInitials, setTaskCreateInitials] = useState<TaskCreateInitials>({});
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get('teamId');
  
  const { currentTeam, refreshTeamData } = useAuth();
  
  const actualTeamId = useMemo(() => {
    if (teamId === '0' || !teamId) {
      return currentTeam?.id || null;
    }
    return teamId;
  }, [teamId, currentTeam?.id]);

  const viewMode = (searchParams.get('view') as ViewMode) || 'month';
  
  const setViewMode = useCallback((mode: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  const { 
    data: teamData, 
    isLoading, 
    isFetching,
    refetch 
  } = useTeamData(actualTeamId);
  
  const tasks = useMemo(() => teamData?.tasks || [], [teamData?.tasks]);
  const teamMembers = useMemo(() => teamData?.members || [], [teamData?.members]);
  const projects = useMemo(() => teamData?.projects || [], [teamData?.projects]);

  const {
    selectedTask,
    isDrawerOpen,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
  } = useTaskHandlers({ refetch, tasks });

  const tasksByDate = useMemo(() => {
    if (!tasks || tasks.length === 0) return {};
    return groupTasksByDate(tasks);
  }, [tasks]);

  const isInitialLoading = isLoading && !teamData;
  const isRefreshing = Boolean(isFetching && teamData);

  // 팀 멤버 매핑 최적화
  const teamMembersMap = useMemo(() => {
    const map = new Map();
    teamMembers.forEach(member => {
      map.set(member.id, member);
    });
    return map;
  }, [teamMembers]);

  const taskCreateModalProps = useMemo(() => ({
    teamId: actualTeamId || undefined,
    teamMembers,
    projects,
    isLoading
  }), [actualTeamId, teamMembers, projects, isLoading]);

  const openTaskCreateModal = useCallback((opts?: TaskCreateInitials) => {
    setTaskCreateInitials({ 
      initialStatus: opts?.initialStatus, 
      initialDueDate: opts?.initialDueDate 
    });
    setIsTaskCreateOpen(true);
  }, []);

  const taskMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTaskMove = useCallback((taskId: string, newDueDate: string) => {
    if (taskMoveTimeoutRef.current) {
      clearTimeout(taskMoveTimeoutRef.current);
    }
    
    taskMoveTimeoutRef.current = setTimeout(() => {
      refetch();
    }, 500);
  }, [refetch]);

  const navigateDate = useCallback((direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  }, [currentDate, viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    currentDate,
    viewMode,
    setViewMode,
    tasks,
    teamMembers,
    teamMembersMap,
    projects,
    tasksByDate,
    selectedTask,
    isDrawerOpen,
    isTaskCreateOpen,
    taskCreateInitials,
    isTeamCreateModalOpen,
    isInitialLoading,
    isRefreshing,
    taskCreateModalProps,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    openTaskCreateModal,
    handleTaskMove,
    navigateDate,
    goToToday,
    setIsTaskCreateOpen,
    setIsTeamCreateModalOpen,
    refreshTeamData,
    currentTeam
  };
};
