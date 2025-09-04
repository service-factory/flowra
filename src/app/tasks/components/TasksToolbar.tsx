"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, RefreshCw } from "lucide-react";

interface TasksToolbarProps {
  searchTerm: string;
  onChangeSearch: (v: string) => void;
  showCompleted: boolean;
  onToggleCompleted: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
  assigneeFilter: "all" | "me" | null;
  setAssigneeFilter: (v: "all" | "me" | null) => void;
  dueFilter: "today" | "this_week" | "overdue" | null;
  setDueFilter: (v: "today" | "this_week" | "overdue" | null) => void;
  priorityFilter: "high" | "medium" | "low" | null;
  setPriorityFilter: (v: "high" | "medium" | "low" | null) => void;
  onClearQuickFilters: () => void;
}

export function TasksToolbar({
  searchTerm,
  onChangeSearch,
  showCompleted,
  onToggleCompleted,
  isRefreshing,
  onRefresh,
  assigneeFilter,
  setAssigneeFilter,
  dueFilter,
  setDueFilter,
  priorityFilter,
  setPriorityFilter,
  onClearQuickFilters,
}: TasksToolbarProps) {
  const hasQuickFilters = Boolean(assigneeFilter || dueFilter || priorityFilter);

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Input
          placeholder="업무, 담당자, 태그로 검색..."
          value={searchTerm}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="pl-10 h-9 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800"
        />
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">⌘K</span>
        {searchTerm && (
          <button
            onClick={() => onChangeSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs"
          >
            지우기
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant={assigneeFilter === "me" ? "default" : "outline"}
            size="sm"
            onClick={() => setAssigneeFilter(assigneeFilter === "me" ? null : "me")}
            className="h-8 border-gray-300 dark:border-gray-600"
          >
            내 업무
          </Button>
          <Button
            variant={dueFilter === "today" ? "default" : "outline"}
            size="sm"
            onClick={() => setDueFilter(dueFilter === "today" ? null : "today")}
            className="h-8 border-gray-300 dark:border-gray-600"
          >
            오늘 마감
          </Button>
          <Button
            variant={dueFilter === "overdue" ? "default" : "outline"}
            size="sm"
            onClick={() => setDueFilter(dueFilter === "overdue" ? null : "overdue")}
            className="h-8 border-gray-300 dark:border-gray-600"
          >
            지연
          </Button>
          <Button
            variant={priorityFilter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriorityFilter(priorityFilter === "high" ? null : "high")}
            className="h-8 border-gray-300 dark:border-gray-600"
          >
            우선순위 높음
          </Button>
        </div>
        <Button
          variant={showCompleted ? "default" : "outline"}
          size="sm"
          onClick={onToggleCompleted}
          className="h-8 border-gray-300 dark:border-gray-600"
        >
          <Eye className="h-4 w-4 mr-1.5" /> 완료 표시
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          className="h-8 border-gray-300 dark:border-gray-600"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} /> 새로고침
        </Button>
        {hasQuickFilters && (
          <Button variant="ghost" size="sm" onClick={onClearQuickFilters} className="h-8">
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}


