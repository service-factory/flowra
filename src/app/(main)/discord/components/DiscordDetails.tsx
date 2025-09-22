import { memo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Hash } from "lucide-react";
import { DiscordStatus } from '../types/discord';
import { getPermissionIcon } from '../utils/discordUtils';
import { DiscordDetailsSkeleton } from './DiscordLoadingSkeleton';

interface DiscordDetailsProps {
  discordStatus: DiscordStatus | null;
  isLoading?: boolean;
}

export const DiscordDetails = memo(function DiscordDetails({
  discordStatus,
  isLoading = false,
}: DiscordDetailsProps) {
  if (isLoading) {
    return <DiscordDetailsSkeleton />;
  }

  if (!discordStatus) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-blue-600" />
            서버 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {discordStatus.guild && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {discordStatus.guild.icon ? (
                <Image 
                  src={discordStatus.guild.icon} 
                  alt={discordStatus.guild.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <Server className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {discordStatus.guild.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {discordStatus.guild.memberCount}명의 멤버
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  ID: {discordStatus.guild.id}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-purple-600" />
            채널 및 권한
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {discordStatus.channel && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded flex items-center justify-center">
                <Hash className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  #{discordStatus.channel.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">텍스트 채널</p>
              </div>
            </div>
          )}

          {discordStatus.botPermissions && discordStatus.botPermissions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">봇 권한:</p>
              <div className="grid grid-cols-2 gap-2">
                {discordStatus.botPermissions.map((permission) => (
                  <Badge key={permission} variant="secondary" className="justify-start">
                    <span className="mr-1">{getPermissionIcon(permission)}</span>
                    {permission}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
