import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ComponentType } from "react";
import {
  Brain,
  Target,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  ArrowRight,
  Lightbulb,
  Timer
} from "lucide-react";
import { DashboardStats, Task } from '../types/dashboard';

interface ProductivityInsightsProps {
  stats: DashboardStats;
  tasks: Task[];
  isLoading?: boolean;
}

export const ProductivityInsights = memo(function ProductivityInsights({
  stats,
  tasks,
  isLoading = false
}: ProductivityInsightsProps) {
  const getProductivityScore = () => {
    if (stats.totalTasks === 0) return 0;
    const completionRate = (stats.completedTasks / stats.totalTasks) * 100;
    const overdueRate = (stats.overdueTasks / stats.totalTasks) * 100;
    const progressRate = (stats.inProgressTasks / stats.totalTasks) * 100;

    return Math.max(0, Math.min(100, completionRate - (overdueRate * 2) + (progressRate * 0.5)));
  };

  const getProductivityLevel = (score: number) => {
    if (score >= 85) return { label: '뛰어남', color: 'text-emerald-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' };
    if (score >= 70) return { label: '우수', color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' };
    if (score >= 55) return { label: '보통', color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' };
    if (score >= 40) return { label: '개선필요', color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { label: '주의필요', color: 'text-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20' };
  };

  const getHighPriorityTasks = () => {
    return tasks.filter(task =>
      task.priority === 'high' && task.status !== 'completed'
    ).slice(0, 3);
  };

  const getUpcomingDeadlines = () => {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return tasks.filter(task => {
      if (!task.due_date || task.status === 'completed') return false;
      const dueDate = new Date(task.due_date);
      return dueDate >= today && dueDate <= nextWeek;
    }).slice(0, 3);
  };

  const getRecommendations = () => {
    type Recommendation = {
      icon: ComponentType<{ className?: string }>;
      title: string;
      description: string;
      action: string;
      priority: 'high' | 'medium' | 'low';
    };
    const recommendations: Recommendation[] = [];

    if (stats.overdueTasks > 0) {
      recommendations.push({
        icon: Timer,
        title: "지연 업무 처리",
        description: `${stats.overdueTasks}개의 지연된 업무를 우선 처리하세요`,
        action: "지연 업무 보기",
        priority: "high"
      });
    }

    const highPriorityCount = getHighPriorityTasks().length;
    if (highPriorityCount > 0) {
      recommendations.push({
        icon: Target,
        title: "우선순위 업무 집중",
        description: `${highPriorityCount}개의 고우선순위 업무에 집중하세요`,
        action: "우선순위 업무 보기",
        priority: "medium"
      });
    }

    const upcomingCount = getUpcomingDeadlines().length;
    if (upcomingCount > 0) {
      recommendations.push({
        icon: Calendar,
        title: "마감 임박 업무 확인",
        description: `이번 주에 ${upcomingCount}개의 마감 예정 업무가 있습니다`,
        action: "일정 확인하기",
        priority: "medium"
      });
    }

    if (stats.inProgressTasks === 0 && stats.totalTasks > 0) {
      recommendations.push({
        icon: Zap,
        title: "업무 시작하기",
        description: "새로운 업무를 시작해보세요",
        action: "업무 선택하기",
        priority: "low"
      });
    }

    return recommendations.slice(0, 2);
  };

  const productivityScore = getProductivityScore();
  const productivityLevel = getProductivityLevel(productivityScore);
  const recommendations = getRecommendations();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <span>생산성 인사이트</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Productivity Score */}
          <div className={`p-4 rounded-lg ${productivityLevel.bgColor} border border-gray-100 dark:border-gray-800`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className={`h-5 w-5 ${productivityLevel.color}`} />
                <span className="font-medium text-gray-900 dark:text-white">생산성 점수</span>
              </div>
              <Badge variant="outline" className={productivityLevel.color}>
                {productivityLevel.label}
              </Badge>
            </div>
            <div className={`text-3xl font-bold mb-2 ${productivityLevel.color}`}>
              {Math.round(productivityScore)}
            </div>
            <Progress value={productivityScore} className="h-2 mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              이번 주 평균보다 {productivityScore >= 70 ? '높은' : '낮은'} 성과입니다
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  완료율
                </span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </div>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  진행률
                </span>
              </div>
              <div className="text-xl font-bold text-green-600">
                {stats.thisWeekProgress}%
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-gray-900 dark:text-white">팀 협업</span>
            </div>
            <div className="text-lg font-bold text-purple-600 mb-1">
              {stats.teamMembers}명 활동 중
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              평균 {stats.totalTasks > 0 ? Math.round(stats.totalTasks / stats.teamMembers) : 0}개 업무/인
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              오늘의 추천 액션
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'high' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10' :
                    rec.priority === 'medium' ? 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10' :
                    'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                  } transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      rec.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                      rec.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                      'bg-blue-100 dark:bg-blue-900/30'
                    }`}>
                      <rec.icon className={`h-4 w-4 ${
                        rec.priority === 'high' ? 'text-red-600' :
                        rec.priority === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {rec.description}
                      </p>
                      <Button variant="ghost" size="sm" className="text-xs p-1 h-auto">
                        {rec.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});