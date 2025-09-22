import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { DashboardStats } from "../types/dashboard";

interface TeamProgressProps {
  stats: DashboardStats;
}

export const TeamProgress = memo(function TeamProgress({ stats }: TeamProgressProps) {
  return (
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
            {stats.thisWeekProgress}%
          </div>
          <Progress value={stats.thisWeekProgress} className="h-3 mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">
            목표 대비 우수한 성과입니다! 🎉
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
