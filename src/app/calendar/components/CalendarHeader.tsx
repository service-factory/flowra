"use client";

import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Clock,
} from "lucide-react";

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: "month" | "week" | "day";
  onViewModeChange: (mode: "month" | "week" | "day") => void;
  onNavigate: (direction: "prev" | "next") => void;
  onGoToToday: () => void;
  onTaskCreate: (newTask: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any
  openTaskCreateModal?: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onGoToToday,
  openTaskCreateModal
}: CalendarHeaderProps) {
  const formatDateTitle = () => {
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

  return (
    <div className="flex items-center justify-between py-4">
      {/* 왼쪽: 날짜 네비게이션 및 현재 날짜 */}
      <div className="flex items-center space-x-4">
        {/* 날짜 네비게이션 */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("prev")}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            size="sm"
            onClick={onGoToToday}
            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white"
          >
            오늘
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("next")}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 현재 날짜 표시 */}
        <div className="text-lg font-semibold text-gray-900 dark:text-white">
          {formatDateTitle()}
        </div>
      </div>

      {/* 오른쪽: 뷰 모드 선택 및 액션 버튼 */}
      <div className="flex items-center space-x-4">
        {/* 뷰 모드 선택 */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
          <Button
            variant={viewMode === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("month")}
            className="flex-1 h-8 rounded-md text-xs"
          >
            <Grid3X3 className="h-3 w-3 mr-1" />
            월간
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("week")}
            className="flex-1 h-8 rounded-md text-xs"
          >
            <List className="h-3 w-3 mr-1" />
            주간
          </Button>
          <Button
            variant={viewMode === "day" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("day")}
            className="flex-1 h-8 rounded-md text-xs"
          >
            <Clock className="h-3 w-3 mr-1" />
            일간
          </Button>
        </div>

        {/* 태스크 생성 버튼 */}
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => openTaskCreateModal?.()}
        >
          새 업무
        </Button>
      </div>
    </div>
  );
}
