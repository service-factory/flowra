import { memo } from 'react';
import { Target } from "lucide-react";
import { KanbanBoard } from "./KanbanBoard";
import { TaskListCard } from "./TaskListCard";
import { Button } from "@/components/ui/button";
import { getTagColor, getStatusColor, getStatusText, getPriorityColor } from "@/lib/utils/taskUtils";
import { PriorityIcon } from "@/components/ui/priority-icon";
import { kanbanColumns } from "@/lib/constants/kanbanColumns";
import type { ViewMode } from "@/hooks/useViewMode";
import { KanbanBoardSkeleton, TaskListSkeleton } from './TasksLoadingSkeleton';

interface TaskViewRendererProps {
  viewMode: ViewMode;
  filteredTasks: any[];
  isLoading: boolean;
  teamId?: string;
  currentTeam?: any;
  onTaskMove: (taskId: string, newStatus: string) => void;
  onTaskClick: (task: any) => void;
  openTaskCreateModal: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskStatusUpdate?: (taskId: string, status: string) => Promise<void>;
}

export const TaskViewRenderer = memo(function TaskViewRenderer({
  viewMode,
  filteredTasks,
  isLoading,
  teamId,
  // currentTeam,
  onTaskMove,
  onTaskClick,
  openTaskCreateModal,
  onTaskDelete,
  onTaskStatusUpdate,
}: TaskViewRendererProps) {
  if (isLoading) {
    if (viewMode === "kanban") {
      return <KanbanBoardSkeleton />;
    }
    if (viewMode === "list") {
      return <TaskListSkeleton />;
    }
    return <TaskListSkeleton />;
  }

  if (viewMode === "kanban") {
    return (
      <KanbanBoard
        columns={kanbanColumns}
        tasks={filteredTasks}
        onTaskMove={onTaskMove}
        onTaskClick={onTaskClick}
        openTaskCreateModal={openTaskCreateModal}
        onTaskDelete={onTaskDelete}
        onTaskStatusUpdate={onTaskStatusUpdate}
        teamId={teamId}
      />
    );
  }

  if (viewMode === "list") {
    return (
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {filteredTasks.length > 0 ? (
          <>
            {/* 테이블 헤더 */}
            <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
              <div className="grid grid-cols-12 gap-4 items-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <div className="col-span-1">유형</div>
                <div className="col-span-1">우선순위</div>
                <div className="col-span-4">요약</div>
                <div className="col-span-2">상태</div>
                <div className="col-span-2">담당자</div>
                <div className="col-span-2">기한</div>
              </div>
            </div>
            
            {/* 태스크 목록 */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <TaskListCard
                  key={task.id}
                  task={task}
                  getTagColor={getTagColor}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={(priority: string) => <PriorityIcon priority={priority} />}
                  onTaskClick={onTaskClick}
                  onTaskDelete={onTaskDelete}
                  onTaskStatusUpdate={onTaskStatusUpdate}
                  teamId={teamId}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              업무가 없습니다
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              검색 조건에 맞는 업무가 없습니다. 새로운 업무를 생성하거나 필터를 조정해보세요.
            </p>
            <Button 
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => openTaskCreateModal()}
              disabled={isLoading}
            >
              새 업무
            </Button>
          </div>
        )}
      </div>
    );
  }


  return null;
});
