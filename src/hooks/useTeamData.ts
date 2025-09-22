import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

interface TeamData {
  tasks: any[];
  members: any[];
  tags: any[];
  projects: any[];
}

export function useTeamData(teamId: string | null) {
  const query = useQuery({
    queryKey: ['teamData', teamId],
    queryFn: async (): Promise<TeamData> => {
      if (!teamId || teamId === 'null' || teamId === 'undefined') {
        throw new Error('유효한 팀 ID가 필요합니다');
      }

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('세션 토큰이 없습니다');
      }

      const teamDataResponse = await fetch(`/api/tasks?teamId=${teamId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!teamDataResponse.ok) {
        const errorData = await teamDataResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `팀 데이터 가져오기 실패 (${teamDataResponse.status})`);
      }

      const teamData = await teamDataResponse.json();
      
      const projectsResponse = await fetch(`/api/projects?teamId=${teamId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      let projects = [];
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        projects = projectsData.data?.projects || projectsData.projects || [];
      } else {
        const errorData = await projectsResponse.json().catch(() => ({}));
        console.error('프로젝트 데이터 요청 실패:', { status: projectsResponse.status, error: errorData });
      }
      
      const result = {
        tasks: teamData.data?.tasks || teamData.tasks || [],
        members: teamData.data?.members || teamData.members || [],
        tags: teamData.data?.tags || teamData.tags || [],
        projects: projects
      };
      
      return result;
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000, // 5분간 데이터 신선도 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    refetchOnWindowFocus: false,
    refetchOnMount: false, // 마운트 시 자동 리페치 비활성화
    refetchOnReconnect: true, // 네트워크 재연결 시 리페치
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000)
  });

  return query;
}
