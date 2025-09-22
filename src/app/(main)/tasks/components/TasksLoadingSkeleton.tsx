import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const TasksToolbarSkeleton = () => (
  <div className="mb-4 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-24" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-28" />
    </div>
  </div>
);

export const ViewModeSelectorSkeleton = () => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-8 w-20" />
    </div>
    <Skeleton className="h-6 w-32" />
  </div>
);

export const KanbanBoardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {Array.from({ length: 4 }).map((_, columnIndex) => (
      <div key={columnIndex} className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-8" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <Card key={cardIndex} className="p-4">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-5 w-12" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const TaskListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex items-center space-x-1">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </Card>
    ))}
  </div>
);

export const TaskDetailDrawerSkeleton = () => (
  <div className="fixed inset-0 z-50 bg-black/50">
    <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
