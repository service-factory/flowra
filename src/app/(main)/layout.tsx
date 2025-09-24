'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LeftNavigationBar } from '@/components/left-navigation-bar';
import useAuth from '@/hooks/useAuth';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLnbCollapsed, setIsLnbCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const { teamMemberships, currentTeam, isLoading: authLoading, user, setCurrentTeam } = useAuth();
  const [authReady, setAuthReady] = useState(false);

  // 비로그인 시 메인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading) {
      setAuthReady(true);
    }
  }, [authLoading]);

  useEffect(() => {
    if (authReady && !user) {
      router.replace('/');
    }
  }, [authReady, user, router]);

  // 현재 활성 페이지 결정
  const getActivePage = () => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/tasks')) return 'tasks';
    if (pathname.includes('/calendar')) return 'calendar';
    if (pathname.includes('/team')) return 'team';
    if (pathname.includes('/settings')) return 'settings';
    if (pathname.includes('/discord')) return 'discord';
    return 'dashboard';
  };

  // 페이지별 제목과 부제목 결정
  const getPageInfo = () => {
    const activePage = getActivePage();
    
    switch (activePage) {
      case 'dashboard':
        return {
          title: 'Dashboard',
          subtitle: '프로젝트 개요'
        };
      case 'tasks':
        return {
          title: 'Tasks',
          subtitle: '업무 관리'
        };
      case 'calendar':
        return {
          title: 'Calendar',
          subtitle: '일정 관리'
        };
      case 'team':
        return {
          title: 'Team',
          subtitle: currentTeam?.name || '팀원 관리'
        };
      case 'settings':
        return {
          title: '설정',
          subtitle: '계정 및 앱 설정'
        };
      case 'discord':
        return {
          title: 'Discord',
          subtitle: 'Discord 연동'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: '프로젝트 개요'
        };
    }
  };

  const teamsData = useMemo(() => {
    return teamMemberships.map(membership => {
      // 각 팀의 실제 정보를 가져오기 위해 teamMemberships에서 팀 정보 추출
      const teamInfo = membership.teams;
      return {
        id: membership.team_id,
        name: teamInfo?.name || '팀',
        slug: teamInfo?.slug || 'team',
        description: teamInfo?.description,
        color: (teamInfo?.settings as Record<string, unknown>)?.color as string || 'blue',
        icon: (teamInfo?.settings as Record<string, unknown>)?.icon as string || 'Building2',
        is_active: teamInfo?.is_active || true
      };
    });
  }, [teamMemberships]);

  const pageInfo = getPageInfo();

  // URL의 teamId와 스토어의 currentTeam 동기화
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const teamId = params.get('teamId');
    if (teamId && teamMemberships.length > 0) {
      const found = teamMemberships.find(m => m.team_id === teamId);
      if (found && (!currentTeam || currentTeam.id !== found.team_id)) {
        setCurrentTeam(found.teams || null);
      }
    }
  }, [teamMemberships, currentTeam, setCurrentTeam]);

  // 로딩 상태
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <NotificationProvider>
      <div className="min-h-screen">
        <LeftNavigationBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          isCollapsed={isLnbCollapsed}
          onToggleCollapse={() => setIsLnbCollapsed(!isLnbCollapsed)}
          activePage={getActivePage()}
          teams={teamsData}
          currentTeam={currentTeam}
          onTeamChange={(team) => {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('teamId', team.id);
            router.push(newUrl.pathname + newUrl.search);
          }}
        />
        
        <div className="px-4 py-4 ml-16">
          {children}
        </div>
      </div>
    </NotificationProvider>
  );
}
