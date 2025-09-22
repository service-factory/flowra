import { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Bot, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { DiscordStatus } from '../types/discord';
import { DiscordHeaderSkeleton } from './DiscordLoadingSkeleton';

interface DiscordHeaderProps {
  discordStatus: DiscordStatus | null;
  isChecking: boolean;
  isLoading?: boolean;
}

export const DiscordHeader = memo(function DiscordHeader({
  discordStatus,
  isChecking,
  isLoading = false,
}: DiscordHeaderProps) {
  if (isLoading) {
    return <DiscordHeaderSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            Discord 연동
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Discord 봇을 연결하여 채널에서 업무를 관리할 수 있습니다.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {discordStatus?.connected ? (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-200 dark:border-green-800">
              <Wifi className="h-3 w-3 mr-1" />
              연결됨
            </Badge>
          ) : (
            <Badge variant="outline" className="text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600">
              <WifiOff className="h-3 w-3 mr-1" />
              연결 안됨
            </Badge>
          )}
          
          {isChecking && (
            <RefreshCw className="h-4 w-4 animate-spin text-gray-500" />
          )}
        </div>
      </div>
    </div>
  );
});
