import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useTeamData } from '@/hooks/useTeamData';
import { customFetch } from '@/lib/requests/customFetch';
import { DashboardStats, DiscordStatus } from '../types/dashboard';

const mockStats: DashboardStats = {
  totalTasks: 24,
  completedTasks: 18,
  inProgressTasks: 4,
  overdueTasks: 2,
  teamMembers: 5,
  thisWeekProgress: 85
};

export const useDashboardData = () => {
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus>({ 
    connected: false, 
    loading: false 
  });
  
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { currentTeam } = useAuth();
  
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
        success: boolean;
        data: {
          connected: boolean;
          guild?: { name: string; icon?: string };
        };
      }>({ url: `/api/discord/status?teamId=${actualTeamId}` });
      
      setDiscordStatus({
        connected: response.data?.connected || false,
        guild: response.data?.guild,
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

  const isInitialLoading = isLoading && !teamData;

  return {
    stats,
    discordStatus,
    teamData,
    isLoading: isInitialLoading,
    currentTeam,
  };
};
