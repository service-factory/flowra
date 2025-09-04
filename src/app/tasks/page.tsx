"use client";

import { useState } from "react";
import {
  CheckCircle,
  Target,
  List,
  Trash2,
  Archive,
  User,
  ChevronDown,
  Kanban,
  Table,
  Filter as FilterIcon,
  Download,
  SortAsc,
  Square,
  Circle,
  Triangle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { HeaderBar } from "@/components/header-bar";
import { TaskCreateModal } from "@/components/task-create-modal";
import { TasksToolbar } from "./components/TasksToolbar";
import { TaskListCard } from "./components/TaskListCard";
import { TagFilterPanel } from "./components/TagFilterPanel";
import { KanbanBoard } from "./components/KanbanBoard";
import { TaskTable } from "./components/TaskTable";

// Mock data - 실제로는 API에서 가져올 데이터
const mockTasks = [
  {
    id: "1",
    title: "홈페이지 디자인 완성",
    description: "메인 페이지 UI/UX 디자인 및 반응형 구현을 완료해야 합니다. 사용자 경험을 최우선으로 고려하여 직관적인 인터페이스를 설계합니다.",
    status: "in_progress",
    priority: "high",
    assignee: { id: "1", name: "김디자인", avatar: "/avatars/kim.jpg", email: "kim@example.com" },
    creator: { id: "2", name: "이PM", avatar: "/avatars/pm.jpg" },
    dueDate: "2024-12-20",
    createdAt: "2024-12-15",
    updatedAt: "2024-12-18",
    progress: 75,
    tags: ["디자인", "UI/UX", "프론트엔드"],
    comments: 3,
    attachments: 2,
    storyPoints: 8,
    epic: "사용자 인터페이스",
    sprint: "Sprint 1",
    labels: ["frontend", "design", "high-priority"]
  },
  {
    id: "2", 
    title: "API 연동 작업",
    description: "백엔드 API와 프론트엔드 연동 작업을 진행합니다. RESTful API 설계 원칙에 따라 구현하고, 에러 핸들링을 철저히 해야 합니다.",
    status: "pending",
    priority: "medium",
    assignee: { id: "3", name: "이개발", avatar: "/avatars/lee.jpg", email: "lee@example.com" },
    creator: { id: "2", name: "이PM", avatar: "/avatars/pm.jpg" },
    dueDate: "2024-12-22",
    createdAt: "2024-12-16",
    updatedAt: "2024-12-17",
    progress: 30,
    tags: ["백엔드", "API", "개발"],
    comments: 1,
    attachments: 0,
    storyPoints: 13,
    epic: "백엔드 개발",
    sprint: "Sprint 1",
    labels: ["backend", "api", "integration"]
  },
  {
    id: "3",
    title: "데이터베이스 설계",
    description: "사용자 및 업무 관리 테이블 설계를 완료했습니다. 정규화를 통해 데이터 무결성을 보장하고, 인덱스를 최적화했습니다.",
    status: "completed",
    priority: "high",
    assignee: { id: "4", name: "박백엔드", avatar: "/avatars/park.jpg", email: "park@example.com" },
    creator: { id: "2", name: "이PM", avatar: "/avatars/pm.jpg" },
    dueDate: "2024-12-18",
    createdAt: "2024-12-10",
    updatedAt: "2024-12-18",
    progress: 100,
    tags: ["데이터베이스", "설계", "완료"],
    comments: 5,
    attachments: 3,
    storyPoints: 21,
    epic: "데이터베이스",
    sprint: "Sprint 0",
    labels: ["database", "design", "completed"]
  },
  {
    id: "4",
    title: "테스트 코드 작성",
    description: "단위 테스트 및 통합 테스트 작성이 필요합니다. Jest와 React Testing Library를 사용하여 테스트 커버리지를 90% 이상 달성해야 합니다.",
    status: "pending",
    priority: "low",
    assignee: { id: "5", name: "최테스트", avatar: "/avatars/choi.jpg", email: "choi@example.com" },
    creator: { id: "2", name: "이PM", avatar: "/avatars/pm.jpg" },
    dueDate: "2024-12-25",
    createdAt: "2024-12-17",
    updatedAt: "2024-12-17",
    progress: 0,
    tags: ["테스트", "QA", "개발"],
    comments: 0,
    attachments: 0,
    storyPoints: 5,
    epic: "품질 보증",
    sprint: "Sprint 2",
    labels: ["testing", "qa", "coverage"]
  },
  {
    id: "5",
    title: "사용자 인증 시스템",
    description: "소셜 로그인 (카카오, 구글) 인증 시스템을 구현합니다. JWT 토큰 기반 인증과 보안을 강화해야 합니다.",
    status: "in_progress",
    priority: "high",
    assignee: { id: "3", name: "이개발", avatar: "/avatars/lee.jpg", email: "lee@example.com" },
    creator: { id: "2", name: "이PM", avatar: "/avatars/pm.jpg" },
    dueDate: "2024-12-21",
    createdAt: "2024-12-14",
    updatedAt: "2024-12-19",
    progress: 60,
    tags: ["인증", "보안", "소셜로그인"],
    comments: 2,
    attachments: 1,
    storyPoints: 13,
    epic: "인증 시스템",
    sprint: "Sprint 1",
    labels: ["auth", "security", "oauth"]
  },
  {
    id: "6",
    title: "모바일 반응형 최적화",
    description: "모바일 디바이스에서의 사용자 경험을 개선하기 위한 반응형 최적화 작업을 진행합니다.",
    status: "pending",
    priority: "medium",
    assignee: { id: "1", name: "김디자인", avatar: "/avatars/kim.jpg", email: "kim@example.com" },
    creator: { id: "2", name: "이PM", avatar: "/avatars/pm.jpg" },
    dueDate: "2024-12-23",
    createdAt: "2024-12-18",
    updatedAt: "2024-12-18",
    progress: 0,
    tags: ["모바일", "반응형", "UI"],
    comments: 0,
    attachments: 0,
    storyPoints: 8,
    epic: "사용자 인터페이스",
    sprint: "Sprint 2",
    labels: ["mobile", "responsive", "ui"]
  }
];

const mockTeamMembers = [
  { id: "1", name: "김디자인", avatar: "/avatars/kim.jpg", email: "kim@example.com" },
  { id: "2", name: "이PM", avatar: "/avatars/pm.jpg", email: "pm@example.com" },
  { id: "3", name: "이개발", avatar: "/avatars/lee.jpg", email: "lee@example.com" },
  { id: "4", name: "박백엔드", avatar: "/avatars/park.jpg", email: "park@example.com" },
  { id: "5", name: "최테스트", avatar: "/avatars/choi.jpg", email: "choi@example.com" }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(mockTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "table">("kanban");
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [groupBy, setGroupBy] = useState("status");
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "me" | null>(null);
  const [dueFilter, setDueFilter] = useState<"today" | "this_week" | "overdue" | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<"high" | "medium" | "low" | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50";
      case "pending": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800/50";
      case "overdue": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50";
      default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "완료";
      case "in_progress": return "진행중";
      case "pending": return "대기";
      case "overdue": return "지연";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 dark:text-red-400";
      case "medium": return "text-amber-600 dark:text-amber-400";
      case "low": return "text-emerald-600 dark:text-emerald-400";
      default: return "text-slate-500 dark:text-slate-400";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "높음";
      case "medium": return "보통";
      case "low": return "낮음";
      default: return priority;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <Triangle className="h-3 w-3 fill-current" />;
      case "medium": return <Square className="h-3 w-3 fill-current" />;
      case "low": return <Circle className="h-3 w-3 fill-current" />;
      default: return <Circle className="h-3 w-3 fill-current" />;
    }
  };

  // 모든 태그 추출
  const allTags = Array.from(new Set(tasks.flatMap(task => task.tags))).sort();
  
  // 태그별 색상 매핑
  const getTagColor = (tag: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50",
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50",
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/50",
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50",
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50",
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800/50",
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800/50"
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const isThisWeek = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7; // Monday as start
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return d >= new Date(monday.toDateString()) && d <= new Date(sunday.toDateString());
  };

  const isOverdue = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    return d < endOfToday && ["completed", "cancelled"].includes((null as any)) === false && true && (true);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCompleted = showCompleted || task.status !== "completed";
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => task.tags.includes(tag));
    const matchesAssignee = assigneeFilter === null || assigneeFilter === "all" || (assigneeFilter === "me" && task.assignee.email === "lee@example.com");
    const matchesDue = dueFilter === null || (
      dueFilter === "today" && isToday(task.dueDate)
    ) || (
      dueFilter === "this_week" && isThisWeek(task.dueDate)
    ) || (
      dueFilter === "overdue" && new Date(task.dueDate) < new Date() && task.status !== "completed"
    );
    const matchesPriority = priorityFilter === null || task.priority === priorityFilter;
    return matchesSearch && matchesCompleted && matchesTags && matchesAssignee && matchesDue && matchesPriority;
  });

  // 칸반 보드용 상태별 그룹핑 - Notion/Monday.com 스타일
  const kanbanColumns = [
    { 
      id: "pending", 
      title: "대기", 
      color: "bg-slate-50/50 border-slate-200 dark:bg-slate-900/30 dark:border-slate-800", 
      headerColor: "bg-slate-100/80 dark:bg-slate-800/80",
      count: 0 
    },
    { 
      id: "in_progress", 
      title: "진행중", 
      color: "bg-blue-50/30 border-blue-200/50 dark:bg-blue-950/20 dark:border-blue-800/50", 
      headerColor: "bg-blue-100/60 dark:bg-blue-900/40",
      count: 0 
    },
    { 
      id: "completed", 
      title: "완료", 
      color: "bg-emerald-50/30 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/50", 
      headerColor: "bg-emerald-100/60 dark:bg-emerald-900/40",
      count: 0 
    }
  ];

  const groupedTasks = kanbanColumns.map(column => ({
    ...column,
    tasks: filteredTasks.filter(task => task.status === column.id),
    count: filteredTasks.filter(task => task.status === column.id).length
  }));

  const handleTaskSelect = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTasks(
      selectedTasks.length === filteredTasks.length 
        ? [] 
        : filteredTasks.map(task => task.id)
    );
  };

  const handleTaskCreate = (newTask: any) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const clearAllQuickFilters = () => {
    setAssigneeFilter(null);
    setDueFilter(null);
    setPriorityFilter(null);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // 컴포넌트로 분리 (Kanban/List)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <HeaderBar
        title="Tasks"
        subtitle="Flowra Team"
        rightActions={(
          <>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 px-3"
              onClick={() => setShowTagFilter(!showTagFilter)}
            >
              <FilterIcon className="h-4 w-4 mr-1.5" />
              필터
              {selectedTags.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                  {selectedTags.length}
                </span>
              )}
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 h-8 px-3">
              <Download className="h-4 w-4 mr-1.5" />
              내보내기
            </Button>
            <TaskCreateModal onTaskCreate={handleTaskCreate} />
          </>
        )}
      />

      <div className="px-4 py-4">
        {/* Jira/Monday.com 스타일 검색 + 빠른필터 바 (컴포넌트) */}
        <div className="mb-4">
          <TasksToolbar
            searchTerm={searchTerm}
            onChangeSearch={setSearchTerm}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted(!showCompleted)}
            isRefreshing={isRefreshing}
            onRefresh={handleRefresh}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            dueFilter={dueFilter}
            setDueFilter={setDueFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onClearQuickFilters={clearAllQuickFilters}
          />

          {/* 태그 필터 패널 */}
          {showTagFilter && (
            <TagFilterPanel
              allTags={allTags}
              selectedTags={selectedTags}
              onToggle={handleTagToggle}
              onClear={clearTagFilters}
              getTagColor={getTagColor}
            />
          )}
        </div>

        {/* 뷰 모드 및 정렬 - Monday.com 스타일 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden bg-white dark:bg-gray-800">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3"
              >
                <Kanban className="h-4 w-4 mr-1.5" />
                칸반
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3"
              >
                <List className="h-4 w-4 mr-1.5" />
                리스트
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-none border-0 hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-3"
              >
                <Table className="h-4 w-4 mr-1.5" />
                테이블
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">정렬:</span>
              <Button variant="outline" size="sm" className="h-8 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 px-3">
                <SortAsc className="h-3 w-3 mr-1" />
                생성일
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{filteredTasks.length}</span>
              <span>개 업무</span>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <span className="font-medium">{selectedTags.length}</span>
                <span>개 태그 필터</span>
              </div>
            )}
            {selectedTasks.length > 0 && (
              <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                <span className="font-medium">{selectedTasks.length}</span>
                <span>개 선택됨</span>
              </div>
            )}
          </div>
        </div>

        {/* 벌크 액션 - Monday.com 스타일 */}
        {selectedTasks.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedTasks.length}개 업무가 선택되었습니다
                </span>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 h-8 px-3">
                  <CheckCircle className="h-4 w-4 mr-1.5" />
                  완료로 변경
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 h-8 px-3">
                  <User className="h-4 w-4 mr-1.5" />
                  담당자 변경
                </Button>
                <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/30 h-8 px-3">
                  <Archive className="h-4 w-4 mr-1.5" />
                  보관
                </Button>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30 h-8 px-3">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 칸반 보드 - Monday.com 스타일 */}
        {viewMode === "kanban" && (
          <KanbanBoard
            columns={kanbanColumns}
            tasks={filteredTasks}
            getTagColor={getTagColor}
            onToggleTag={handleTagToggle}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getPriorityColor={getPriorityColor}
            getPriorityIcon={getPriorityIcon}
            selectedTasks={selectedTasks}
            onToggleSelect={handleTaskSelect}
            onTaskCreate={handleTaskCreate}
          />
        )}

        {/* 리스트 뷰 */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TaskListCard
                  key={task.id}
                  task={task}
                  selected={selectedTasks.includes(task.id)}
                  onToggleSelect={() => handleTaskSelect(task.id)}
                  getTagColor={getTagColor}
                  onToggleTag={handleTagToggle}
                  getStatusColor={getStatusColor}
                  getStatusText={getStatusText}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                />
              ))
            ) : (
              <div className="text-center py-16">
                <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  업무가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                  검색 조건에 맞는 업무가 없습니다. 새로운 업무를 생성하거나 필터를 조정해보세요.
                </p>
                <TaskCreateModal onTaskCreate={handleTaskCreate} />
              </div>
            )}
          </div>
        )}

        {/* 테이블 뷰 - Monday.com 스타일 */}
        {viewMode === "table" && (
          <TaskTable
            tasks={filteredTasks}
            selectedTasks={selectedTasks}
            onToggleSelect={handleTaskSelect}
            onToggleTag={handleTagToggle}
            getTagColor={getTagColor}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getPriorityColor={getPriorityColor}
            getPriorityIcon={getPriorityIcon}
          />
        )}
      </div>
    </div>
  );
}