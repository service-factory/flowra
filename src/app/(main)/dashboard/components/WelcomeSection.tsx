import { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { DashboardStats } from '../types/dashboard';

interface WelcomeSectionProps {
  stats?: DashboardStats;
  currentTeam?: { name: string } | null;
  userName?: string;
  isLoading?: boolean;
}

export const WelcomeSection = memo(function WelcomeSection(props: WelcomeSectionProps) {
  const { stats, currentTeam, userName = "사용자" } = props;
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? "좋은 아침입니다" :
                      currentHour < 18 ? "좋은 오후입니다" : "수고하셨습니다";

  const getMotivationalMessage = () => {
    if (!stats) return "오늘도 최선을 다해보세요! 💪";

    const completionRate = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

    if (completionRate >= 80) return "놀라운 성과를 보여주고 있네요! 🎉";
    if (completionRate >= 60) return "순조롭게 진행되고 있습니다! 🚀";
    if (stats.overdueTasks > 0) return "밀린 업무들을 처리해보세요! ⚡";
    return "오늘도 화이팅입니다! 💪";
  };

  const todayInsights = [
    {
      icon: CheckCircle2,
      label: "오늘 완료",
      value: stats?.completedTasks || 0,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      icon: Clock,
      label: "진행 중",
      value: stats?.inProgressTasks || 0,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      icon: AlertTriangle,
      label: "지연",
      value: stats?.overdueTasks || 0,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20"
    }
  ];

  return (
    <div className="mb-8">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {timeGreeting}, {userName}님! 👋
                  </h1>
                  {currentTeam && (
                    <Badge variant="outline" className="mt-1">
                      {currentTeam.name} 팀
                    </Badge>
                  )}
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 text-lg">
                {getMotivationalMessage()}
              </p>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end">
              <div className="grid grid-cols-3 gap-3 lg:flex lg:gap-4">
                {todayInsights.map((insight) => (
                  <div
                    key={insight.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg ${insight.bgColor} min-w-0`}
                  >
                    <insight.icon className={`h-4 w-4 ${insight.color} flex-shrink-0`} />
                    <div className="min-w-0">
                      <div className={`font-semibold ${insight.color}`}>
                        {insight.value}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {insight.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {stats?.thisWeekProgress !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600 dark:text-gray-400">
                    이번 주 진척률:
                  </span>
                  <span className="font-semibold text-green-600">
                    {stats.thisWeekProgress}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
