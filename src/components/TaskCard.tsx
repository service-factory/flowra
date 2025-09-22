import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  MoreHorizontal, 
  Star 
} from "lucide-react";
import { Task, TeamMember } from "@/app/(main)/dashboard/types/dashboard";
import { getStatusColor, getStatusText, getPriorityColor } from "@/app/(main)/dashboard/utils/taskUtils";

interface TaskCardProps {
  task: Task;
  assignee?: TeamMember;
}

export const TaskCard = ({ task, assignee }: TaskCardProps) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  
  return (
    <Card className="hover:shadow-md transition-shadow">
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
};
