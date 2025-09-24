import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Calendar,
  User,
  PlayCircle,
  PauseCircle,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import TaskCreateModal from "@/components/task-create-modal";
import { Task, TeamData } from "../types/dashboard";
import { TaskCardSkeleton } from "./LoadingSkeleton";

interface RecentTasksProps {
  filteredTasks: Task[];
  teamData?: TeamData;
  isLoading: boolean;
  currentTeamId?: string;
  isTaskCreateOpen: boolean;
  onTaskCreateOpenChange: (open: boolean) => void;
}

type FilterType = 'all' | 'high' | 'overdue' | 'in_progress';

export const RecentTasks = ({
  filteredTasks,
  teamData,
  isLoading,
  currentTeamId,
  isTaskCreateOpen,
  onTaskCreateOpenChange
}: RecentTasksProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const getFilteredTasks = () => {
    let tasks = filteredTasks;

    switch (activeFilter) {
      case 'high':
        tasks = tasks.filter(task => task.priority === 'high');
        break;
      case 'overdue':
        tasks = tasks.filter(task => {
          if (!task.due_date) return false;
          return new Date(task.due_date) < new Date() && task.status !== 'completed';
        });
        break;
      case 'in_progress':
        tasks = tasks.filter(task => task.status === 'in_progress');
        break;
      default:
        break;
    }

    return tasks;
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          label: '긴급',
          icon: AlertTriangle
        };
      case 'medium':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          label: '보통',
          icon: Clock
        };
      default:
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          label: '낮음',
          icon: CheckCircle
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', label: '완료' };
      case 'in_progress':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', label: '진행중' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/30', label: '대기' };
    }
  };

  const getDaysUntilDue = (dueDate: string | undefined) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const EnhancedTaskCard = ({ task }: { task: Task }) => {
    const assignee = teamData?.members?.find(member => member.id === task.assignee_id);
    const priorityConfig = getPriorityConfig(task.priority);
    const statusConfig = getStatusConfig(task.status);
    const daysUntilDue = getDaysUntilDue(task.due_date);
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

    return (
      <Card className="hover:shadow-md transition-all duration-200 border-l-4"
            style={{ borderLeftColor: priorityConfig.color.replace('text-', '#') }}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-full ${priorityConfig.bgColor} flex-shrink-0`}>
                  <priorityConfig.icon className={`h-3 w-3 ${priorityConfig.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  <priorityConfig.icon className="h-3 w-3 mr-1" />
                  {priorityConfig.label}
                </Badge>

                <Badge
                  variant="outline"
                  className={`text-xs ${statusConfig.color}`}
                >
                  {statusConfig.label}
                </Badge>

                {task.due_date && (
                  <div className={`flex items-center gap-1 text-xs ${
                    isOverdue ? 'text-red-600' :
                    daysUntilDue! <= 3 ? 'text-yellow-600' :
                    'text-gray-600'
                  }`}>
                    <Calendar className="h-3 w-3" />
                    <span>
                      {isOverdue
                        ? `${Math.abs(daysUntilDue!)}일 지연`
                        : daysUntilDue === 0
                          ? '오늘 마감'
                          : `${daysUntilDue}일 남음`
                      }
                    </span>
                  </div>
                )}

                {assignee && (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <User className="h-3 w-3" />
                    <span>{assignee.full_name || assignee.email}</span>
                  </div>
                )}
              </div>

              {task.progress !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">진행률</span>
                    <span className="font-medium">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {assignee && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={assignee.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {assignee.full_name?.[0] || assignee.email?.[0]}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="flex gap-1">
                {task.status !== 'completed' && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    {task.status === 'in_progress' ? (
                      <PauseCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-blue-600" />
                    )}
                  </Button>
                )}

                {task.status !== 'completed' && (
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  </Button>
                )}

                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const filterButtons = [
    { key: 'all', label: '전체', count: filteredTasks.length },
    { key: 'high', label: '긴급', count: filteredTasks.filter(t => t.priority === 'high').length },
    { key: 'overdue', label: '지연', count: filteredTasks.filter(t => {
      if (!t.due_date) return false;
      return new Date(t.due_date) < new Date() && t.status !== 'completed';
    }).length },
    { key: 'in_progress', label: '진행중', count: filteredTasks.filter(t => t.status === 'in_progress').length }
  ];

  const displayTasks = getFilteredTasks();

  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">업무 현황</h2>
        <TaskCreateModal
          teamId={currentTeamId}
          teamMembers={teamData?.members || []}
          projects={teamData?.projects || []}
          isLoading={isLoading}
          onTaskCreate={() => {}}
          open={isTaskCreateOpen}
          onOpenChange={onTaskCreateOpenChange}
          key="task-create-modal-in-dashboard"
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {filterButtons.map((filter) => (
            <Button
              key={filter.key}
              variant={activeFilter === filter.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter(filter.key as FilterType)}
              className="text-xs"
            >
              {filter.label}
              {filter.count > 0 && (
                <Badge variant="secondary" className="ml-2 h-4 min-w-4 text-xs">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))
        ) : displayTasks.length > 0 ? (
          <div className="space-y-3">
            {displayTasks.map((task) => (
              <EnhancedTaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {activeFilter === 'all' ? '업무가 없습니다' :
                   activeFilter === 'high' ? '긴급 업무가 없습니다' :
                   activeFilter === 'overdue' ? '지연된 업무가 없습니다' :
                   '진행 중인 업무가 없습니다'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activeFilter === 'all' ? '새로운 업무를 생성해보세요' : '다른 필터를 확인해보세요'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
