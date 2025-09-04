"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Logo } from "@/components/ui/logo";
import { 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Menu,
  Search,
  Filter,
  MoreHorizontal,
  Star,
  Target,
  Zap
} from "lucide-react";
import Link from "next/link";

// Mock data - 실제로는 API에서 가져올 데이터
const mockTasks = [
  {
    id: "1",
    title: "홈페이지 디자인 완성",
    description: "메인 페이지 UI/UX 디자인 및 반응형 구현",
    status: "in_progress",
    priority: "high",
    assignee: { name: "김디자인", avatar: "/avatars/kim.jpg" },
    dueDate: "2024-12-20",
    progress: 75
  },
  {
    id: "2", 
    title: "API 연동 작업",
    description: "백엔드 API와 프론트엔드 연동",
    status: "pending",
    priority: "medium",
    assignee: { name: "이개발", avatar: "/avatars/lee.jpg" },
    dueDate: "2024-12-22",
    progress: 30
  },
  {
    id: "3",
    title: "데이터베이스 설계",
    description: "사용자 및 업무 관리 테이블 설계",
    status: "completed",
    priority: "high",
    assignee: { name: "박백엔드", avatar: "/avatars/park.jpg" },
    dueDate: "2024-12-18",
    progress: 100
  },
  {
    id: "4",
    title: "테스트 코드 작성",
    description: "단위 테스트 및 통합 테스트 작성",
    status: "pending",
    priority: "low",
    assignee: { name: "최테스트", avatar: "/avatars/choi.jpg" },
    dueDate: "2024-12-25",
    progress: 0
  }
];

const mockStats = {
  totalTasks: 24,
  completedTasks: 18,
  inProgressTasks: 4,
  overdueTasks: 2,
  teamMembers: 5,
  thisWeekProgress: 85
};

const mockRecentActivity = [
  {
    id: "1",
    type: "task_completed",
    message: "김디자인님이 '홈페이지 디자인 완성' 업무를 완료했습니다",
    timestamp: "2분 전",
    user: { name: "김디자인", avatar: "/avatars/kim.jpg" }
  },
  {
    id: "2",
    type: "task_created",
    message: "새로운 업무 'API 연동 작업'이 생성되었습니다",
    timestamp: "1시간 전",
    user: { name: "이개발", avatar: "/avatars/lee.jpg" }
  },
  {
    id: "3",
    type: "comment_added",
    message: "박백엔드님이 '데이터베이스 설계'에 댓글을 추가했습니다",
    timestamp: "3시간 전",
    user: { name: "박백엔드", avatar: "/avatars/park.jpg" }
  }
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

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

  const filteredTasks = selectedFilter === "all" 
    ? mockTasks 
    : mockTasks.filter(task => task.status === selectedFilter);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <Logo size="md" variant="default" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Flowra</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">대시보드</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="업무 검색..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
              
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/user.jpg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="flex flex-col h-full">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">팀 프로젝트</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Flowra 개발팀</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-2">
              <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
                <Target className="h-4 w-4" />
                <span>대시보드</span>
              </Link>
              <Link href="/tasks" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <CheckCircle className="h-4 w-4" />
                <span>업무 관리</span>
              </Link>
              <Link href="/calendar" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Calendar className="h-4 w-4" />
                <span>캘린더</span>
              </Link>
              <Link href="/team" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Users className="h-4 w-4" />
                <span>팀 관리</span>
              </Link>
              <Link href="/settings" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <Settings className="h-4 w-4" />
                <span>설정</span>
              </Link>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              안녕하세요! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              오늘도 팀과 함께 조화롭게 업무를 진행해보세요.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 업무</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료된 업무</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{mockStats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((mockStats.completedTasks / mockStats.totalTasks) * 100)}% 완료율
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행 중</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{mockStats.inProgressTasks}</div>
                <p className="text-xs text-muted-foreground">
                  활발히 진행 중
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">지연된 업무</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{mockStats.overdueTasks}</div>
                <p className="text-xs text-muted-foreground">
                  주의가 필요합니다
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Tasks */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">최근 업무</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    필터
                  </Button>
                  <Link href="/tasks/create">
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      새 업무
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                            <Badge className={getStatusColor(task.status)}>
                              {getStatusText(task.status)}
                            </Badge>
                            <Star className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {task.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={task.assignee.avatar} />
                                  <AvatarFallback>{task.assignee.name[0]}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {task.assignee.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Calendar className="h-4 w-4" />
                                <span>{task.dueDate}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          {task.status === "in_progress" && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">진행률</span>
                                <span className="text-gray-900 dark:text-white">{task.progress}%</span>
                              </div>
                              <Progress value={task.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Team Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>이번 주 진행률</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {mockStats.thisWeekProgress}%
                    </div>
                    <Progress value={mockStats.thisWeekProgress} className="h-3 mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      목표 대비 우수한 성과입니다! 🎉
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>최근 활동</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRecentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={activity.user.avatar} />
                          <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/tasks/create" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      새 업무 생성
                    </Button>
                  </Link>
                  <Link href="/calendar" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      일정 확인
                    </Button>
                  </Link>
                  <Link href="/team" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      팀원 초대
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
