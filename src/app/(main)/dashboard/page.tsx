"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TaskCreateModal from "@/components/task-create-modal";
import { TeamCreateModal } from "@/components/team-create-modal";
import { TeamGuard } from "@/components/team-guard";
import { useAuth } from "@/hooks/useAuth";
import { useTeamData } from "@/hooks/useTeamData";
import { customFetch } from "@/lib/requests/customFetch";
import { DiscordOnboarding } from "@/components/discord-onboarding";
import { 
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  TrendingUp,
  Filter,
  MoreHorizontal,
  Star,
  Target,
  Zap,
  Bot,
  Settings
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
  const [selectedFilter] = useState("all");
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [discordStatus, setDiscordStatus] = useState<{
    connected: boolean;
    guild?: { name: string; icon?: string };
    loading: boolean;
  }>({ connected: false, loading: true });
  
  // 팀 데이터 가져오기
  const { refreshTeamData, currentTeam } = useAuth();
  const { data: teamData, isLoading } = useTeamData(currentTeam?.id || null);

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
          guild: response.guild,
          loading: false
        });
      } catch (error) {
        console.error('Discord 상태 확인 오류:', error);
        setDiscordStatus({ connected: false, loading: false });
      }
    };

    checkDiscordStatus();
  }, [currentTeam?.id]);

  // 실제 데이터로 통계 계산
  const stats = useMemo(() => {
    if (!teamData?.tasks) return mockStats;
    
    const tasks = teamData.tasks;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
    const overdueTasks = tasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date) < new Date() && task.status !== 'completed';
    }).length;
    
    const teamMembersCount = teamData.members?.length || 0;
    const thisWeekProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      teamMembers: teamMembersCount,
      thisWeekProgress
    };
  }, [teamData]);

  // 필터링된 태스크
  const filteredTasks = useMemo(() => {
    if (!teamData?.tasks) return mockTasks;
    
    let filtered = teamData.tasks;
    
    if (selectedFilter === "completed") {
      filtered = filtered.filter(task => task.status === 'completed');
    } else if (selectedFilter === "in_progress") {
      filtered = filtered.filter(task => task.status === 'in_progress');
    } else if (selectedFilter === "pending") {
      filtered = filtered.filter(task => task.status === 'pending');
    } else if (selectedFilter === "overdue") {
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        return new Date(task.due_date) < new Date() && task.status !== 'completed';
      });
    }
    
    return filtered.slice(0, 4); // 최대 4개만 표시
  }, [teamData, selectedFilter]);

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


  return (
    <TeamGuard>
      <div>
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
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {isLoading ? "로딩 중..." : "전체 업무 수"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료된 업무</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}% 완료율
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행 중</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgressTasks}</div>
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
                <div className="text-2xl font-bold text-red-600">{stats.overdueTasks}</div>
                <p className="text-xs text-muted-foreground">
                  주의가 필요합니다
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Discord 온보딩 */}
          <div className="mb-8">
            <DiscordOnboarding />
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
                  <TaskCreateModal 
                    teamId={currentTeam?.id}
                    teamMembers={teamData?.members || []}
                    projects={teamData?.projects || []}
                    isLoading={isLoading}
                    onTaskCreate={() => {}}
                    open={isTaskCreateOpen}
                    onOpenChange={setIsTaskCreateOpen}
                    key="task-create-modal-in-dashboard" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredTasks.map((task) => {
                  const assignee = teamData?.members?.find(member => member.id === task.assignee_id);
                  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                  
                  return (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                              <Badge className={getStatusColor(isOverdue ? 'overdue' : task.status)}>
                                {getStatusText(isOverdue ? 'overdue' : task.status)}
                              </Badge>
                              <Star className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                              {task.description || '설명이 없습니다'}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={assignee?.avatar_url} />
                                    <AvatarFallback>
                                      {assignee?.full_name?.[0] || assignee?.email?.[0] || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {assignee?.full_name || assignee?.email || '할당되지 않음'}
                                  </span>
                                </div>
                                {task.due_date && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(task.due_date).toLocaleDateString('ko-KR')}</span>
                                  </div>
                                )}
                              </div>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                            {task.status === "in_progress" && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                  <span className="text-gray-600 dark:text-gray-400">진행률</span>
                                  <span className="text-gray-900 dark:text-white">진행 중</span>
                                </div>
                                <Progress value={50} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
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

              {/* Discord Integration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bot className="h-5 w-5" />
                    <span>Discord 연동</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {discordStatus.loading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">연동 상태 확인 중...</p>
                    </div>
                  ) : discordStatus.connected ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">연동됨</span>
                      </div>
                      {discordStatus.guild && (
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {discordStatus.guild.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Discord 서버</p>
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        매일 마감일 리마인드를 받을 수 있습니다
                      </div>
                      <Link href="/settings/discord" className="block">
                        <Button size="sm" variant="outline" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          설정 관리
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <span className="text-sm font-medium text-orange-700 dark:text-orange-400">미연동</span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        Discord를 연동하면 매일 아침 마감일 리마인드를 받을 수 있습니다
                      </div>
                      <Link href="/settings/discord" className="block">
                        <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                          <Bot className="h-4 w-4 mr-2" />
                          Discord 연동하기
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <TaskCreateModal 
                    key="task-create-modal-in-dashboard"
                    onTaskCreate={() => {}}
                    trigger={
                      <Button className="w-full justify-start" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        새 업무 생성
                      </Button>
                    }
                  />
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
      </div>

    {/* Team Create Modal */}
    <TeamCreateModal 
      isOpen={isTeamCreateModalOpen} 
      onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async (teamData) => {
          console.log('팀 생성:', teamData);
          // 팀 생성 성공 시 팀 정보 새로고침
          await refreshTeamData();
          // tasks 페이지로 이동
          window.location.href = '/tasks?teamId=0';
        }}
    />
    </TeamGuard>
  );
}
