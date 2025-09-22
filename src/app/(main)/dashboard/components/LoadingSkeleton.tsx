import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StatsCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-4" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-8 w-12 mb-2" />
      <Skeleton className="h-3 w-24" />
    </CardContent>
  </Card>
);

export const TaskCardSkeleton = () => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-4 w-full mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ActivitySkeleton = () => (
  <div className="flex items-start space-x-3">
    <Skeleton className="h-8 w-8 rounded-full" />
    <div className="flex-1 min-w-0">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-3 w-16" />
    </div>
  </div>
);

export const DiscordIntegrationSkeleton = () => (
  <Card>
    <CardHeader>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-24" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-8 w-full" />
      </div>
    </CardContent>
  </Card>
);
