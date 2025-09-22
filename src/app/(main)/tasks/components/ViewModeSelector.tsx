import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Kanban, List, SortAsc, ChevronDown } from "lucide-react";
import type { ViewMode } from "@/hooks/useViewMode";
import { ViewModeSelectorSkeleton } from './TasksLoadingSkeleton';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filteredTasksCount: number;
  selectedTagsCount: number;
  isLoading?: boolean;
}

export const ViewModeSelector = memo(function ViewModeSelector({
  viewMode,
  onViewModeChange,
  filteredTasksCount,
  selectedTagsCount,
  isLoading = false,
}: ViewModeSelectorProps) {
  if (isLoading) {
    return <ViewModeSelectorSkeleton />;
  }

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="flex rounded-md overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("kanban")}
            className={`rounded-none border-0 h-8 px-3 ${
              viewMode === "kanban" 
                ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100" 
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Kanban className="h-4 w-4 mr-1.5" />
            칸반
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={`rounded-none border-0 h-8 px-3 ${
              viewMode === "list" 
                ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100" 
                : "hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <List className="h-4 w-4 mr-1.5" />
            리스트
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">정렬:</span>
          <Button variant="outline" size="sm" className="h-8 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 px-3 shadow-none">
            <SortAsc className="h-3 w-3 mr-1" />
            생성일
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{filteredTasksCount}</span>
          <span>개 업무</span>
        </div>
        {selectedTagsCount > 0 && (
          <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
            <span className="font-medium">{selectedTagsCount}</span>
            <span>개 태그 필터</span>
          </div>
        )}
      </div>
    </div>
  );
});
