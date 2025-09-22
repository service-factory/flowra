import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Trash2, Settings } from "lucide-react";
import { DiscordStatus } from '../types/discord';
import { DiscordActionsSkeleton } from './DiscordLoadingSkeleton';

interface DiscordActionsProps {
  discordStatus: DiscordStatus | null;
  isChecking: boolean;
  isLoading: boolean;
  onRefresh: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

export const DiscordActions = memo(function DiscordActions({
  discordStatus,
  isChecking,
  isLoading,
  onRefresh,
  onDisconnect,
  loading = false,
}: DiscordActionsProps) {
  if (loading) {
    return <DiscordActionsSkeleton />;
  }

  if (!discordStatus) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          관리
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            상태 새로고침
          </Button>
          <Button 
            variant="destructive" 
            onClick={onDisconnect}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            연결 해제
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
