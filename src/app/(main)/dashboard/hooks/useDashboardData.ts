import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTeamData } from '@/hooks/useTeamData';
import { customFetch } from '@/lib/requests/customFetch';
import { DashboardStats, DiscordStatus, RecentActivity, Task } from '../types/dashboard';

const mockRecentActivity: RecentActivity[] = [
  {
    id: "1",
    type: "task_completed",
    message: "김디자인님이 '홈페이지 디자인 완성' 업무를 완료했습니다",
    timestamp: "2분 전",
    user: { name: "김디자인", avatar: "/avatars/kim.jpg" }
  },
  {
    id: "2",
    type: "task_created",
    message: "새로운 업무 'API 연동 작업'이 생성되었습니다",
    timestamp: "1시간 전",
    user: { name: "이개발", avatar: "/avatars/lee.jpg" }
  },
  {
    id: "3",
    type: "comment_added",
    message: "박백엔드님이 '데이터베이스 설계'에 댓글을 추가했습니다",
    timestamp: "3시간 전",
    user: { name: "박백엔드", avatar: "/avatars/park.jpg" }
  }
];

const mockStats: DashboardStats = {
  totalTasks: 24,
  completedTasks: 18,
  inProgressTasks: 4,
  overdueTasks: 2,
  teamMembers: 5,
  thisWeekProgress: 85
};

export const useDashboardData = () => {
  const [selectedFilter] = useState("all");
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus>({ 
    connected: false, 
    loading: false 
  });
  
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { refreshTeamData, currentTeam } = useAuth();
  
  // URL 파라미터의 teamId를 우선 사용, 없으면 currentTeam 사용
  const actualTeamId = teamId && teamId !== '0' ? teamId : currentTeam?.id;
  
  const { data: teamData, isLoading } = useTeamData(actualTeamId || null);

  const checkDiscordStatus = useCallback(async () => {
    if (!actualTeamId) {
      setDiscordStatus({ connected: false, loading: false });
      return;
    }

    setDiscordStatus(prev => ({ ...prev, loading: true }));

    try {
      const response = await customFetch.getFetch<undefined, {
        connected: boolean;
        guild?: { name: string; icon?: string };
      }>({ url: `/api/discord/status?teamId=${actualTeamId}` });
      
      setDiscordStatus({
        connected: response.connected,
        guild: response.guild,
        loading: false
      });
    } catch (error) {
      console.error('Discord 상태 확인 오류:', error);
      setDiscordStatus({ connected: false, loading: false });
    }
  }, [actualTeamId]);

  useEffect(() => {
    checkDiscordStatus();
  }, [checkDiscordStatus]);

  const stats = useMemo((): DashboardStats => {
    if (!teamData?.tasks) return mockStats;
    
    const tasks = teamData.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date) < new Date() && task.status !== 'completed';
    }).length;
    
    const teamMembersCount = teamData.members?.length || 0;
    const thisWeekProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      teamMembers: teamMembersCount,
      thisWeekProgress
    };
  }, [teamData]);

  const filteredTasks = useMemo((): Task[] => {
    if (!teamData?.tasks) return [];
    
    let filtered = teamData.tasks;
    
    if (selectedFilter === "completed") {
      filtered = filtered.filter(task => task.status === 'completed');
    } else if (selectedFilter === "in_progress") {
      filtered = filtered.filter(task => task.status === 'in_progress');
    } else if (selectedFilter === "pending") {
      filtered = filtered.filter(task => task.status === 'pending');
    } else if (selectedFilter === "overdue") {
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        return new Date(task.due_date) < new Date() && task.status !== 'completed';
      });
    }
    
    return filtered.slice(0, 4);
  }, [teamData, selectedFilter]);

  const isInitialLoading = isLoading && !teamData;

  return {
    stats,
    filteredTasks,
    discordStatus,
    teamData,
    isLoading: isInitialLoading,
    refreshTeamData,
    currentTeam,
    recentActivity: mockRecentActivity
  };
};
