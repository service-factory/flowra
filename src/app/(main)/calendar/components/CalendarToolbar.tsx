"use client";

import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  Clock,
} from "lucide-react";

import { Button } from "@/components/ui/button";

interface CalendarToolbarProps {
  currentDate: Date;
  viewMode: "month" | "week" | "day";
  onViewModeChange: (mode: "month" | "week" | "day") => void;
  onNavigate: (direction: "prev" | "next") => void;
  onGoToToday: () => void;
}

export function CalendarToolbar({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onGoToToday,
}: CalendarToolbarProps) {
  const formatDateTitle = () => {
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
    <div className="mb-6">
      {/* 메인 툴바 - 구글 캘린더 스타일 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          {/* 날짜 네비게이션 */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("prev")}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onGoToToday}
              className="h-8 px-3 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              오늘
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("next")}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* 현재 날짜 표시 */}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatDateTitle()}
          </h2>
        </div>

        {/* 뷰 모드 선택 - 구글 캘린더 스타일 */}
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3 text-sm"
          >
            <Grid3X3 className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">월간</span>
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3 text-sm"
          >
            <List className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">주간</span>
          </Button>
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("day")}
            className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3 text-sm"
          >
            <Clock className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">일간</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
