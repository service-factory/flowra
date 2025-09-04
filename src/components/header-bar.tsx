"use client";

import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { Calendar, Settings, Users, BarChart3, ChevronLeft, ChevronRight, Grid3X3, List, Clock } from "lucide-react";

interface HeaderBarProps {
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
}

export function HeaderBar({ 
  title, 
  subtitle, 
  rightActions,
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onGoToToday,
  showCalendarControls = false
}: HeaderBarProps) {
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
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 월요일 시작
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

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Logo size="sm" variant="default" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
                {subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
            <nav className="hidden sm:flex items-center space-x-1">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <BarChart3 className="h-4 w-4 mr-1.5" /> 대시보드
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <Calendar className="h-4 w-4 mr-1.5" /> 캘린더
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <Users className="h-4 w-4 mr-1.5" /> 팀원
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
                <Settings className="h-4 w-4 mr-1.5" /> 설정
              </Button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Calendar Controls */}
            {showCalendarControls && (
              <div className="flex items-center space-x-4">
                {/* 날짜 네비게이션 */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate?.("prev")}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onGoToToday}
                    className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    오늘
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate?.("next")}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* 현재 날짜 표시 */}
                <div className="hidden md:block px-2">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {formatDateTitle()}
                  </h2>
                </div>

                {/* 뷰 모드 선택 */}
                <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                  <Button
                    variant={viewMode === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange?.("month")}
                    className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3 text-xs"
                  >
                    <Grid3X3 className="h-3 w-3 mr-1.5" />
                    <span className="hidden lg:inline">월간</span>
                  </Button>
                  <Button
                    variant={viewMode === "week" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange?.("week")}
                    className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3 text-xs"
                  >
                    <List className="h-3 w-3 mr-1.5" />
                    <span className="hidden lg:inline">주간</span>
                  </Button>
                  <Button
                    variant={viewMode === "day" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onViewModeChange?.("day")}
                    className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3 text-xs"
                  >
                    <Clock className="h-3 w-3 mr-1.5" />
                    <span className="hidden lg:inline">일간</span>
                  </Button>
                </div>
              </div>
            )}
            
            {/* 기존 rightActions */}
            {rightActions && (
              <div className="flex items-center space-x-3">
                {rightActions}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}


