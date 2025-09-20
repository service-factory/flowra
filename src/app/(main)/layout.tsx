'use client';

import { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LeftNavigationBar } from '@/components/left-navigation-bar';
import { useAuth } from '@/hooks/useAuth';
import { NotificationProvider } from '@/contexts/NotificationContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLnbCollapsed, setIsLnbCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  const { teamMemberships, currentTeam, isLoading: authLoading, user } = useAuth();

  // 현재 활성 페이지 결정
  const getActivePage = () => {
    if (pathname.includes('/dashboard')) return 'dashboard';
    if (pathname.includes('/tasks')) return 'tasks';
    if (pathname.includes('/calendar')) return 'calendar';
    if (pathname.includes('/team')) return 'team';
    if (pathname.includes('/settings')) return 'settings';
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
      default:
        return {
          title: 'Dashboard',
          subtitle: '프로젝트 개요'
        };
    }
  };

  const teamsData = useMemo(() => {
    return teamMemberships.map(membership => ({
      id: membership.team_id,
      name: currentTeam?.name || '팀',
      slug: currentTeam?.slug || 'team',
      description: currentTeam?.description,
      color: (currentTeam?.settings as Record<string, unknown>)?.color as string || 'blue',
      icon: (currentTeam?.settings as Record<string, unknown>)?.icon as string || 'Building2',
      is_active: currentTeam?.is_active || true
    }));
  }, [teamMemberships, currentTeam]);

  const pageInfo = getPageInfo();

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

  // 인증되지 않은 사용자
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            앱을 사용하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
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
