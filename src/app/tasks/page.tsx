"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  MoreHorizontal,
  Star,
  Target,
  Grid3X3,
  List,
  Eye,
  Edit,
  Trash2,
  Copy,
  Archive,
  Tag,
  User,
  CalendarDays,
  Flag,
  MessageSquare,
  ChevronDown,
  Settings,
  BarChart3,
  Kanban,
  Table,
  Zap,
  Filter as FilterIcon
} from "lucide-react";
import Link from "next/link";
import { TaskCreateModal } from "@/components/task-create-modal";

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
    attachments: 2
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
    attachments: 0
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
    attachments: 3
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
    attachments: 0
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
    attachments: 1
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
    attachments: 0
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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
      case "high": return "text-red-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-green-500";
      default: return "text-gray-500";
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // 칸반 보드용 상태별 그룹핑
  const kanbanColumns = [
    { id: "pending", title: "대기", color: "bg-yellow-50 border-yellow-200", count: 0 },
    { id: "in_progress", title: "진행중", color: "bg-blue-50 border-blue-200", count: 0 },
    { id: "completed", title: "완료", color: "bg-green-50 border-green-200", count: 0 }
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

  // 간소화된 칸반 카드
  const KanbanCard = ({ task }: { task: any }) => (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 cursor-pointer hover:shadow-md transition-all duration-200 ${selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => handleTaskSelect(task.id)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedTasks.includes(task.id)}
            onChange={(e) => {
              e.stopPropagation();
              handleTaskSelect(task.id);
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
            {task.title}
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="text-xs">{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
          <span>{task.assignee.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          {task.comments > 0 && (
            <div className="flex items-center space-x-1">
              <MessageSquare className="h-3 w-3" />
              <span>{task.comments}</span>
            </div>
          )}
          <Calendar className="h-3 w-3" />
          <span>{task.dueDate}</span>
        </div>
      </div>
      
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 2).map((tag: string, index: number) => (
            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded text-gray-600 dark:text-gray-400">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );

  // 간소화된 리스트 카드
  const ListCard = ({ task }: { task: any }) => (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-2 hover:shadow-sm transition-all duration-200 ${selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-center space-x-4">
        <input
          type="checkbox"
          checked={selectedTasks.includes(task.id)}
          onChange={() => handleTaskSelect(task.id)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer">
              {task.title}
            </h4>
            <Badge className={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Badge>
            <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
            {task.description}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-gray-500">
            {task.dueDate}
          </div>
          <div className="flex items-center space-x-2">
            {task.comments > 0 && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <MessageSquare className="h-4 w-4" />
                <span>{task.comments}</span>
              </div>
            )}
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 간소화된 헤더 */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Logo size="sm" variant="default" />
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">업무</h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  대시보드
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  캘린더
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <FilterIcon className="h-4 w-4 mr-2" />
                필터
              </Button>
              <TaskCreateModal onTaskCreate={handleTaskCreate} />
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-4">
        {/* 검색 바 */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="업무 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 뷰 모드 토글 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg">
              <Button
                variant={viewMode === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="rounded-r-none"
              >
                <Kanban className="h-4 w-4 mr-2" />
                칸반
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="h-4 w-4 mr-2" />
                리스트
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-l-none"
              >
                <Table className="h-4 w-4 mr-2" />
                테이블
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <span>{filteredTasks.length}개 업무</span>
            {selectedTasks.length > 0 && (
              <span className="text-blue-600">• {selectedTasks.length}개 선택됨</span>
            )}
          </div>
        </div>

        {/* 벌크 액션 */}
        {selectedTasks.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-800 dark:text-blue-200">
                {selectedTasks.length}개 업무가 선택되었습니다
              </span>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  완료
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  보관
                </Button>
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  삭제
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 칸반 보드 */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groupedTasks.map((column) => (
              <div key={column.id} className={`${column.color} rounded-lg border-2 border-dashed p-4 min-h-[600px]`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {column.count}
                    </Badge>
                  </div>
                  <TaskCreateModal 
                    trigger={
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Plus className="h-3 w-3" />
                      </Button>
                    }
                    onTaskCreate={handleTaskCreate}
                  />
                </div>
                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <KanbanCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 리스트 뷰 */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <ListCard key={task.id} task={task} />
              ))
            ) : (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  업무가 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  검색 조건에 맞는 업무가 없습니다.
                </p>
                <TaskCreateModal onTaskCreate={handleTaskCreate} />
              </div>
            )}
          </div>
        )}

        {/* 테이블 뷰 */}
        {viewMode === "table" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      업무
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      담당자
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      마감일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      우선순위
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedTasks.includes(task.id)}
                          onChange={() => handleTaskSelect(task.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {task.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getStatusColor(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.avatar} />
                            <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {task.assignee.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                        {task.dueDate}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-1">
                          <Flag className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                          <span className={`text-sm ${getPriorityColor(task.priority)}`}>
                            {getPriorityText(task.priority)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
