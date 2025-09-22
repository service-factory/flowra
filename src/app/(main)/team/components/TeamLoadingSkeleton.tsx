import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const TeamHeaderSkeleton = () => (
  <div className="mb-8">
    <Skeleton className="h-8 w-48 mb-2" />
    <Skeleton className="h-4 w-64" />
  </div>
);

export const TeamStatsSkeleton = () => (
  <div className="flex items-center space-x-6 text-sm mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);

export const TeamFiltersSkeleton = () => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <div className="flex items-center space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-16" />
          ))}
        </div>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-24" />
    </div>
  </div>
);

export const TeamMembersGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={i} className="hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-3">
              <Skeleton className="h-14 w-14 rounded-full" />
              <Skeleton className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full" />
            </div>
            <div className="mb-3">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-32 mb-2" />
              <div className="flex items-center justify-center space-x-1">
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mb-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto mb-1" />
                  <Skeleton className="h-3 w-8 mx-auto" />
                </div>
              ))}
            </div>
            <div className="flex items-center space-x-1 w-full">
              {Array.from({ length: 3 }).map((_, k) => (
                <Skeleton key={k} className="h-7 flex-1" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const TeamEmptyStateSkeleton = () => (
  <div className="text-center py-12">
    <Skeleton className="h-12 w-12 mx-auto mb-4" />
    <Skeleton className="h-4 w-32 mx-auto mb-2" />
    <Skeleton className="h-3 w-48 mx-auto" />
  </div>
);

export const TeamErrorStateSkeleton = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Card className="max-w-md">
      <CardContent className="p-6 text-center">
        <Skeleton className="h-12 w-12 mx-auto mb-4" />
        <Skeleton className="h-6 w-48 mx-auto mb-2" />
        <Skeleton className="h-4 w-64 mx-auto mb-4" />
        <Skeleton className="h-8 w-24 mx-auto" />
      </CardContent>
    </Card>
  </div>
);
