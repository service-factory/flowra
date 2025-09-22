import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Target,
  CheckCircle,
  Clock,
  AlertCircle
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
  return (
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
  );
};
