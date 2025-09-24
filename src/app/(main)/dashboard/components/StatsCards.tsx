import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Activity
} from "lucide-react";
import { DashboardStats } from "../types/dashboard";
import { StatsCardSkeleton } from "./LoadingSkeleton";

interface StatsCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

export const StatsCards = ({ stats, isLoading }: StatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const progressRate = stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0;
  const overdueRate = stats.totalTasks > 0 ? (stats.overdueTasks / stats.totalTasks) * 100 : 0;

  const statsCards = [
    {
      title: "전체 업무",
      value: stats.totalTasks,
      icon: Target,
      description: "활성 업무",
      trend: stats.totalTasks >= 20 ? "high" : stats.totalTasks >= 10 ? "medium" : "low",
      color: "text-slate-600",
      bgColor: "bg-slate-50 dark:bg-slate-900/20",
      progress: null,
      detail: `${stats.teamMembers}명의 팀원`
    },
    {
      title: "완료된 업무",
      value: stats.completedTasks,
      icon: CheckCircle,
      description: `${Math.round(completionRate)}% 완료`,
      trend: completionRate >= 80 ? "high" : completionRate >= 60 ? "medium" : "low",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      progress: completionRate,
      detail: completionRate >= 80 ? "우수한 성과!" : "꾸준히 진행 중"
    },
    {
      title: "진행 중",
      value: stats.inProgressTasks,
      icon: Clock,
      description: `${Math.round(progressRate)}% 진행 중`,
      trend: stats.inProgressTasks > 0 ? "high" : "low",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      progress: progressRate,
      detail: "활발한 작업 중"
    },
    {
      title: "지연된 업무",
      value: stats.overdueTasks,
      icon: AlertCircle,
      description: stats.overdueTasks > 0 ? `${Math.round(overdueRate)}% 지연` : "지연 없음",
      trend: stats.overdueTasks > 3 ? "high" : stats.overdueTasks > 0 ? "medium" : "low",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      progress: overdueRate,
      detail: stats.overdueTasks > 0 ? "즉시 처리 필요" : "잘 관리되고 있습니다"
    }
  ];

  const getTrendIcon = (trend: string, isOverdue = false) => {
    if (isOverdue) {
      return trend === "low" ? TrendingUp : TrendingDown;
    }
    return trend === "high" ? TrendingUp : trend === "medium" ? Activity : TrendingDown;
  };

  const getTrendColor = (trend: string, isOverdue = false) => {
    if (isOverdue) {
      return trend === "low" ? "text-green-500" : "text-red-500";
    }
    return trend === "high" ? "text-green-500" : trend === "medium" ? "text-blue-500" : "text-gray-500";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => {
        const TrendIcon = getTrendIcon(stat.trend, index === 3);
        const trendColor = getTrendColor(stat.trend, index === 3);
        const isOverdue = index === 3;

        return (
          <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {stat.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline gap-2">
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <Badge
                  variant={stat.trend === "high" ? "default" :
                          stat.trend === "medium" ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {stat.description}
                </Badge>
              </div>

              {stat.progress !== null && (
                <div className="space-y-1">
                  <Progress
                    value={stat.progress}
                    className="h-2"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {stat.detail}
                  </p>
                </div>
              )}

              {stat.progress === null && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Users className="h-3 w-3" />
                  <span>{stat.detail}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
