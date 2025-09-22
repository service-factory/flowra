import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const SettingsHeaderSkeleton = () => (
  <div className="mb-8">
    <Skeleton className="h-8 w-32 mb-2" />
    <Skeleton className="h-4 w-96" />
  </div>
);

export const AccountInfoSkeleton = () => (
  <div className="mb-8">
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const SettingsCategoriesSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i} className="hover:shadow-md transition-all duration-200">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex items-center">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="w-4 h-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const SettingsPageSkeleton = () => (
  <div className="flex">
    <div className="w-64 p-6 border-r border-gray-200 dark:border-gray-700">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
    
    <div className="flex-1 p-6">
      <div className="max-w-4xl">
        <SettingsHeaderSkeleton />
        <AccountInfoSkeleton />
        <SettingsCategoriesSkeleton />
      </div>
    </div>
  </div>
);

export const SettingsLoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <Skeleton className="h-4 w-24 mx-auto" />
    </div>
  </div>
);

export const SettingsUnauthenticatedSkeleton = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <Skeleton className="h-6 w-48 mx-auto mb-2" />
      <Skeleton className="h-4 w-64 mx-auto" />
    </div>
  </div>
);
