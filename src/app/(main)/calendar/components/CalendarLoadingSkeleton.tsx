import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const CalendarHeaderSkeleton = () => (
  <div className="flex items-center justify-between py-4">
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8" />
      </div>
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="flex items-center space-x-4">
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-md p-1">
        <Skeleton className="h-8 w-16 mx-1" />
        <Skeleton className="h-8 w-16 mx-1" />
        <Skeleton className="h-8 w-16 mx-1" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
);

export const CalendarGridSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="p-2 text-center">
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-7 flex-1">
      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="h-full border-r border-b border-gray-200 dark:border-gray-700 p-1.5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CalendarWeekSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
    <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="p-2 text-center">
          <Skeleton className="h-4 w-8 mx-auto" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-7 flex-1">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="h-full border-r border-gray-200 dark:border-gray-700 p-1.5 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-4" />
          </div>
          <div className="flex-1 space-y-0.5">
            {Array.from({ length: 4 }).map((_, j) => (
              <Skeleton key={j} className="h-4 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const CalendarDaySkeleton = () => (
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm flex-1 flex flex-col">
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <Skeleton className="h-6 w-32" />
    </div>
    <div className="flex-1 p-4 space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex space-x-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);
