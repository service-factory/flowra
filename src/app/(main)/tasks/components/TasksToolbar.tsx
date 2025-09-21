"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  RefreshCw, 
  Search, 
  X, 
  Filter, 
  User, 
  Calendar, 
  AlertTriangle,
  Clock,
  Zap,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { customFetch } from "@/lib/requests/customFetch";
import { useAuth } from "@/hooks/useAuth";

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
  teamMembers?: Array<{ id: string; name: string; email: string; }>;
  onCreateTask?: () => void;
  isLoading?: boolean;
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
  teamMembers = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  onCreateTask,
  isLoading = false,
}: TasksToolbarProps) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<{
    connected: boolean;
    loading: boolean;
  }>({ connected: false, loading: true });
  
  const { currentTeam } = useAuth();
  const hasQuickFilters = Boolean(assigneeFilter || dueFilter || priorityFilter);
  const activeFiltersCount = [assigneeFilter, dueFilter, priorityFilter].filter(Boolean).length;

  // Discord 상태 확인
  useEffect(() => {
    const checkDiscordStatus = async () => {
      if (!currentTeam?.id) {
        setDiscordStatus({ connected: false, loading: false });
        return;
      }

      try {
        const response = await customFetch.getFetch<undefined, {
          connected: boolean;
          guild?: { name: string; icon?: string };
        }>({ url: '/api/discord/status' });
        
        setDiscordStatus({
          connected: response.connected,
          loading: false
        });
      } catch (error) {
        console.error('Discord 상태 확인 오류:', error);
        setDiscordStatus({ connected: false, loading: false });
      }
    };

    checkDiscordStatus();
  }, [currentTeam?.id]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="검색"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const quickFilterButtons = [
    {
      id: "me",
      label: "내 업무",
      icon: User,
      active: assigneeFilter === "me",
      onClick: () => setAssigneeFilter(assigneeFilter === "me" ? null : "me"),
      color: "blue"
    },
    {
      id: "today",
      label: "오늘 마감",
      icon: Calendar,
      active: dueFilter === "today",
      onClick: () => setDueFilter(dueFilter === "today" ? null : "today"),
      color: "amber"
    },
    {
      id: "overdue",
      label: "지연",
      icon: AlertTriangle,
      active: dueFilter === "overdue",
      onClick: () => setDueFilter(dueFilter === "overdue" ? null : "overdue"),
      color: "red"
    },
    {
      id: "high",
      label: "우선순위 높음",
      icon: Zap,
      active: priorityFilter === "high",
      onClick: () => setPriorityFilter(priorityFilter === "high" ? null : "high"),
      color: "red"
    }
  ];

  return (
    <div className="space-y-3">
      {/* 메인 툴바 */}
      <div className="flex items-center justify-between gap-3">
        {/* 검색 바 */}
        <div className="relative flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="업무, 담당자, 태그로 검색..."
              value={searchTerm}
              onChange={(e) => onChangeSearch(e.target.value)}
              className="pl-10 pr-20 h-10 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 rounded-lg shadow-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onChangeSearch("")}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                ⌘K
              </Badge>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center gap-2">
          {/* Discord 상태 표시 */}
          {!discordStatus.loading && (
            <div className="hidden lg:flex items-center">
              {discordStatus.connected ? (
                <div className="flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                  <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                  <span className="text-xs text-green-700 dark:text-green-300">Discord 연동됨</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md">
                  <AlertCircle className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                  <span className="text-xs text-orange-700 dark:text-orange-300">Discord 미연동</span>
                </div>
              )}
            </div>
          )}

          {/* 빠른 필터 버튼들 */}
          <div className="hidden lg:flex items-center gap-1">
            {quickFilterButtons.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.id}
                  variant={filter.active ? "default" : "outline"}
                  size="sm"
                  onClick={filter.onClick}
                  className={`h-8 px-3 border-gray-200 dark:border-gray-700 shadow-none ${
                    filter.active 
                      ? `bg-${filter.color}-500 hover:bg-${filter.color}-600 text-white border-${filter.color}-500` 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-3 w-3 mr-1.5" />
                  {filter.label}
                </Button>
              );
            })}
          </div>

          {/* 고급 필터 토글 */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-8 border-gray-200 dark:border-gray-700 shadow-none"
          >
            <Filter className="h-4 w-4 mr-1.5" />
            필터
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 w-4 p-0 text-xs bg-blue-500 text-white">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>

          {/* 완료 표시 토글 */}
          <Button
            variant={showCompleted ? "default" : "outline"}
            size="sm"
            onClick={onToggleCompleted}
            className="h-8 border-gray-200 dark:border-gray-700 shadow-none"
          >
            <Eye className="h-4 w-4 mr-1.5" />
            완료
          </Button>

          {/* 새로고침 */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 border-gray-200 dark:border-gray-700 shadow-none"
          >
            <RefreshCw className={`h-4 w-4 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>

          {/* 새 업무 */}
          {onCreateTask && (
            isLoading ? (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 h-8"
                disabled
              >
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                로딩 중...
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700 h-8"
                onClick={onCreateTask}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                새 업무
              </Button>
            )
          )}

          {/* 필터 초기화 */}
          {hasQuickFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearQuickFilters} 
              className="h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4 mr-1.5" />
              초기화
            </Button>
          )}
        </div>
      </div>

      {/* 고급 필터 패널 */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        showAdvancedFilters 
          ? 'max-h-96 opacity-100' 
          : 'max-h-0 opacity-0'
      }`}>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">필터 옵션</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAdvancedFilters(false)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 담당자 필터 */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                담당자
              </label>
              <div className="space-y-1">
                <Button
                  variant={assigneeFilter === "me" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssigneeFilter(assigneeFilter === "me" ? null : "me")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <User className="h-3 w-3 mr-2" />
                  내 업무만
                </Button>
                <Button
                  variant={assigneeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAssigneeFilter(assigneeFilter === "all" ? null : "all")}
                  className="w-full justify-start h-8 text-xs"
                >
                  모든 담당자
                </Button>
              </div>
            </div>

            {/* 마감일 필터 */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                마감일
              </label>
              <div className="space-y-1">
                <Button
                  variant={dueFilter === "today" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDueFilter(dueFilter === "today" ? null : "today")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <Calendar className="h-3 w-3 mr-2" />
                  오늘 마감
                </Button>
                <Button
                  variant={dueFilter === "this_week" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDueFilter(dueFilter === "this_week" ? null : "this_week")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <Clock className="h-3 w-3 mr-2" />
                  이번 주
                </Button>
                <Button
                  variant={dueFilter === "overdue" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDueFilter(dueFilter === "overdue" ? null : "overdue")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <AlertTriangle className="h-3 w-3 mr-2" />
                  지연됨
                </Button>
              </div>
            </div>

            {/* 우선순위 필터 */}
            <div>
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                우선순위
              </label>
              <div className="space-y-1">
                <Button
                  variant={priorityFilter === "high" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter(priorityFilter === "high" ? null : "high")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <Zap className="h-3 w-3 mr-2" />
                  높음
                </Button>
                <Button
                  variant={priorityFilter === "medium" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter(priorityFilter === "medium" ? null : "medium")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <Zap className="h-3 w-3 mr-2" />
                  보통
                </Button>
                <Button
                  variant={priorityFilter === "low" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter(priorityFilter === "low" ? null : "low")}
                  className="w-full justify-start h-8 text-xs"
                >
                  <Zap className="h-3 w-3 mr-2" />
                  낮음
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일용 빠른 필터 */}
      <div className="lg:hidden">
        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {quickFilterButtons.map((filter) => {
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant={filter.active ? "default" : "outline"}
                size="sm"
                onClick={filter.onClick}
                className={`h-8 px-3 whitespace-nowrap shadow-none ${
                  filter.active 
                    ? `bg-${filter.color}-500 hover:bg-${filter.color}-600 text-white border-${filter.color}-500` 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <Icon className="h-3 w-3 mr-1.5" />
                {filter.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}


