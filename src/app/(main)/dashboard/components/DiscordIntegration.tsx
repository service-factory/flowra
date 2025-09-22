import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  Settings 
} from "lucide-react";
import Link from "next/link";
import { DiscordStatus } from "../types/dashboard";
import { DiscordIntegrationSkeleton } from "./LoadingSkeleton";

interface DiscordIntegrationProps {
  discordStatus: DiscordStatus;
}

export const DiscordIntegration = ({ discordStatus }: DiscordIntegrationProps) => {
  if (discordStatus.loading) {
    return <DiscordIntegrationSkeleton />;
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <span>Discord 연동</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {discordStatus.connected ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">연동됨</span>
            </div>
            {discordStatus.guild && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {discordStatus.guild.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Discord 서버</p>
                </div>
              </div>
            )}
            <div className="text-xs text-gray-600 dark:text-gray-400">
              매일 마감일 리마인드를 받을 수 있습니다
            </div>
            <Link href="/settings/discord" className="block">
              <Button size="sm" variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                설정 관리
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-400">미연동</span>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
              Discord를 연동하면 매일 아침 마감일 리마인드를 받을 수 있습니다
            </div>
            <Link href="/settings/discord" className="block">
              <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Bot className="h-4 w-4 mr-2" />
                Discord 연동하기
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
