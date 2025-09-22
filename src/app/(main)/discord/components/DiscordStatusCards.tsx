import { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Server, Hash } from "lucide-react";
import { DiscordStatus } from '../types/discord';
import { getConnectionStatusText, getGuildName, getChannelName } from '../utils/discordUtils';
import { DiscordStatusCardsSkeleton } from './DiscordLoadingSkeleton';

interface DiscordStatusCardsProps {
  discordStatus: DiscordStatus | null;
  isLoading?: boolean;
}

export const DiscordStatusCards = memo(function DiscordStatusCards({
  discordStatus,
  isLoading = false,
}: DiscordStatusCardsProps) {
  if (isLoading) {
    return <DiscordStatusCardsSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-l-4 border-l-indigo-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">연결 상태</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {getConnectionStatusText(discordStatus)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              discordStatus?.connected 
                ? 'bg-green-100 dark:bg-green-900/50' 
                : 'bg-red-100 dark:bg-red-900/50'
            }`}>
              {discordStatus?.connected ? (
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Discord 서버</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {getGuildName(discordStatus)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">알림 채널</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {getChannelName(discordStatus)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
              <Hash className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
