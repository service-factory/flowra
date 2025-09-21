"use client";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notification-bell";
import { ReactNode } from "react";
import { 
  Calendar, 
  Settings, 
  Users, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Clock,
  Menu,
  X,
  Filter as FilterIcon,
  Plus,
  Bot,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Team {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
}

interface LeftNavigationBarProps {
  title: string;
  subtitle?: string;
  rightActions?: ReactNode;
  // Calendar 관련 props
  currentDate?: Date;
  viewMode?: "month" | "week" | "day";
  onViewModeChange?: (mode: "month" | "week" | "day") => void;
  onNavigate?: (direction: "prev" | "next") => void;
  onGoToToday?: () => void;
  showCalendarControls?: boolean;
  // LNB 관련 props
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  activePage?: string;
  onPageChange?: (page: string) => void;
  // Team 관련 props
  teams?: Team[];
  currentTeam?: Team | null;
  onTeamChange?: (team: Team) => void;
  onCreateTeam?: () => void;
}

export function LeftNavigationBar({ 
  title, 
  subtitle, 
  rightActions,
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onGoToToday,
  showCalendarControls = false,
  isCollapsed = true,
  onToggleCollapse,
  activePage = "tasks",
  onPageChange,
  teams = [],
  currentTeam,
  onTeamChange,
  onCreateTeam
}: LeftNavigationBarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const queryParams = useSearchParams();
  const teamId = queryParams.get('teamId');
  // 키보드 단축키 (Ctrl/Cmd + B로 토글, ESC로 닫기)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        onToggleCollapse?.();
      } else if (event.key === 'Escape' && !isCollapsed) {
        event.preventDefault();
        onToggleCollapse?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onToggleCollapse, isCollapsed]);

  const formatDateTitle = () => {
    if (!currentDate) return "";
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    switch (viewMode) {
      case "month":
        return `${year}년 ${month}월`;
      case "week":
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
      case "day":
        return `${year}년 ${month}월 ${currentDate.getDate()}일`;
      default:
        return "";
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "대시보드", icon: BarChart3, href: "/dashboard" },
    { id: "calendar", label: "캘린더", icon: Calendar, href: "/calendar" },
    { id: "tasks", label: "업무", icon: List, href: "/tasks" },
    { id: "team", label: "팀원", icon: Users, href: "/team" },
    { id: "discord", label: "Discord", icon: Bot, href: "/discord" },
    { id: "settings", label: "설정", icon: Settings, href: "/settings" },
  ];

  const handlePageChange = (pageId: string) => {
    const item = navigationItems.find(nav => nav.id === pageId);
    if (item) {
      router.push(`${item.href}?teamId=${teamId}`);
      onPageChange?.(pageId);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="h-10 w-10 p-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Left Navigation Bar - Collapsed State */}
      <aside 
        className={`
          fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-0 -translate-x-full'}
          ${isMobileMenuOpen ? 'translate-x-0 w-64' : ''}
          ${!isCollapsed ? 'lg:hidden' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-r border-gray-200 dark:border-gray-700 shadow-lg cursor-pointer">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div 
              className="p-4 border-b border-gray-200 dark:border-gray-700 relative cursor-pointer"
              onClick={() => isCollapsed && onToggleCollapse?.()}
            >
              <div className="flex items-center justify-center">
                <Logo size="sm" variant="default" />
              </div>
              {/* 호버 시 툴팁 */}
              {isHovered && isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50">
                  클릭하거나 Ctrl+B로 열기
                </div>
              )}
            </div>

            {/* Teams Section */}
            {teams.length > 0 && (
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-1">
                  {teams.slice(0, 5).map((team) => {
                    const isActive = teamId === team.id;
                    const teamColor = team.color || 'blue';
                    const colorClasses = {
                      blue: 'bg-blue-500',
                      green: 'bg-green-500',
                      purple: 'bg-purple-500',
                      orange: 'bg-orange-500',
                      red: 'bg-red-500',
                      pink: 'bg-pink-500',
                      indigo: 'bg-indigo-500',
                      teal: 'bg-teal-500'
                    };
                    
                    return (
                      <div key={team.id} className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTeamChange?.(team);
                          }}
                          className={`
                            w-full justify-center h-10 px-2 rounded-md transition-all duration-200
                            ${isActive 
                              ? 'bg-gray-100 dark:bg-gray-700 ring-2 ring-blue-500' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          <div className={`
                            w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-semibold
                            ${colorClasses[teamColor as keyof typeof colorClasses] || 'bg-blue-500'}
                          `}>
                            {team.name.charAt(0).toUpperCase()}
                          </div>
                        </Button>
                        {/* 툴팁 */}
                        {isCollapsed && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            {team.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {/* 팀 추가 버튼 */}
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCreateTeam?.();
                      }}
                      className="w-full justify-center h-10 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Plus className="h-4 w-4 text-gray-500" />
                    </Button>
                    {/* 툴팁 */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        팀 추가
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <div key={item.id} className="relative group">
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation(); // LNB 열기 이벤트 방지
                        handlePageChange(item.id);
                      }}
                      className={`
                        w-full justify-center h-10 px-3 rounded-md transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                    {/* 개별 아이콘 툴팁 */}
                    {isCollapsed && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            {rightActions && (
              <div 
                className="p-3 border-t border-gray-200 dark:border-gray-700 cursor-pointer"
                onClick={() => isCollapsed && onToggleCollapse?.()}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-10 justify-center rounded-md bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  title="필터"
                >
                  <FilterIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Floating Menu - Expanded State */}
      {!isCollapsed && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
            onClick={onToggleCollapse}
          />
          
          {/* Floating Menu */}
          <div 
            className="fixed top-0 h-full w-64 z-30"
          >
            <div className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border border-gray-200 dark:border-gray-700 shadow-xl rounded-r-lg overflow-hidden">
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Logo size="sm" variant="default" />
                      <div>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
                        {subtitle && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      ESC로 닫기
                    </div>
                  </div>
                </div>

                {/* Teams Section */}
                {teams.length > 0 && (
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          팀
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onCreateTeam}
                          className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="space-y-1">
                        {teams.map((team) => {
                          const isActive = currentTeam?.id === team.id;
                          const teamColor = team.color || 'blue';
                          const colorClasses = {
                            blue: 'bg-blue-500',
                            green: 'bg-green-500',
                            purple: 'bg-purple-500',
                            orange: 'bg-orange-500',
                            red: 'bg-red-500',
                            pink: 'bg-pink-500',
                            indigo: 'bg-indigo-500',
                            teal: 'bg-teal-500'
                          };
                          
                          return (
                            <Button
                              key={team.id}
                              variant="ghost"
                              size="sm"
                              onClick={() => onTeamChange?.(team)}
                              className={`
                                w-full justify-start h-8 px-2 rounded-md transition-all duration-200
                                ${isActive 
                                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                                }
                              `}
                            >
                              <div className={`
                                w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-semibold mr-2
                                ${colorClasses[teamColor as keyof typeof colorClasses] || 'bg-blue-500'}
                              `}>
                                {team.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium truncate">{team.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        size="sm"
                        onClick={() => handlePageChange(item.id)}
                        className={`
                          w-full justify-start h-10 px-3 rounded-md transition-all duration-200
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Button>
                    );
                  })}
                </nav>

                {/* Calendar Controls */}
                {showCalendarControls && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="space-y-4">
                      {/* 날짜 네비게이션 */}
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate?.("prev")}
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onGoToToday}
                          className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 hover:shadow-md"
                        >
                          오늘
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate?.("next")}
                          className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* 현재 날짜 표시 */}
                      <div className="text-center">
                        <h2 className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDateTitle()}
                        </h2>
                      </div>

                      {/* 뷰 모드 선택 */}
                      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
                        <Button
                          variant={viewMode === "month" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onViewModeChange?.("month")}
                          className="flex-1 h-8 rounded-md text-xs"
                        >
                          <Grid3X3 className="h-3 w-3 mr-1" />
                          월간
                        </Button>
                        <Button
                          variant={viewMode === "week" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onViewModeChange?.("week")}
                          className="flex-1 h-8 rounded-md text-xs"
                        >
                          <List className="h-3 w-3 mr-1" />
                          주간
                        </Button>
                        <Button
                          variant={viewMode === "day" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => onViewModeChange?.("day")}
                          className="flex-1 h-8 rounded-md text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          일간
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    {/* 알림 벨 */}
                    <div className="flex items-center justify-center">
                      <NotificationBell />
                    </div>
                    
                    {/* 기존 rightActions */}
                    {rightActions && (
                      <div className="space-y-2">
                        {rightActions}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content Spacer */}
      <div className="lg:ml-16" />
    </>
  );
}