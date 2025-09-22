"use client";

import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  List, 
  Clock,
} from "lucide-react";
import { ViewMode } from '../types/calendar';
import { formatDateTitle } from '../utils/calendarUtils';
import { CalendarHeaderSkeleton } from './CalendarLoadingSkeleton';

interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onNavigate: (direction: "prev" | "next") => void;
  onGoToToday: () => void;
  openTaskCreateModal?: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
  isLoading?: boolean;
}

export const CalendarHeader = memo(function CalendarHeader({
  currentDate,
  viewMode,
  onViewModeChange,
  onNavigate,
  onGoToToday,
  openTaskCreateModal,
  isLoading = false
}: CalendarHeaderProps) {
  if (isLoading) {
    return <CalendarHeaderSkeleton />;
  }

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
          {formatDateTitle(currentDate, viewMode)}
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
});
