"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  X, 
  ExternalLink, 
  Clock,
  Bell,
  Zap,
  Users
} from "lucide-react";
import { customFetch } from "@/lib/requests/customFetch";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";

interface DiscordOnboardingProps {
  onClose?: () => void;
  showSkip?: boolean;
}

export function DiscordOnboarding({ onClose, showSkip = true }: DiscordOnboardingProps) {
  const [discordStatus, setDiscordStatus] = useState<{
    connected: boolean;
    loading: boolean;
  }>({ connected: false, loading: true });
  
  const { currentTeam } = useAuth();

  // Discord 상태 확인
  useEffect(() => {
    const checkDiscordStatus = async () => {
      if (!currentTeam?.id) {
        setDiscordStatus({ connected: false, loading: false });
        return;
      }

      try {
        const response = await customFetch.getFetch<undefined, {
          connected: boolean;
          guild?: { name: string; icon?: string };
        }>({ url: '/api/discord/status' });
        
        setDiscordStatus({
          connected: response.connected,
          loading: false
        });
      } catch (error) {
        console.error('Discord 상태 확인 오류:', error);
        setDiscordStatus({ connected: false, loading: false });
      }
    };

    checkDiscordStatus();
  }, [currentTeam?.id]);

  // 이미 연동되어 있으면 온보딩을 표시하지 않음
  if (discordStatus.connected || discordStatus.loading) {
    return null;
  }

  return (
    <Card className="border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <Bot className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-gray-900 dark:text-white">
                Discord와 연동하세요! 🤖
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                매일 아침 마감일 리마인드를 받아보세요
              </p>
            </div>
          </div>
          {showSkip && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* 기능 설명 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">매일 아침 9시</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">자동 리마인드</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Bell className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">마감일 알림</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">업무 놓치지 않기</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
              <Zap className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">빠른 설정</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">시간대 맞춤</p>
              </div>
            </div>
          </div>

          {/* 연동 방법 설명 */}
          <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
              <Users className="h-4 w-4 mr-2 text-indigo-600" />
              연동 방법
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <li className="flex items-start space-x-2">
                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">1</Badge>
                <span>Discord 서버에서 웹훅 URL을 생성합니다</span>
              </li>
              <li className="flex items-start space-x-2">
                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">2</Badge>
                <span>Flowra 설정에서 웹훅 URL을 입력합니다</span>
              </li>
              <li className="flex items-start space-x-2">
                <Badge variant="outline" className="h-5 w-5 p-0 flex items-center justify-center text-xs">3</Badge>
                <span>리마인드 시간과 시간대를 설정합니다</span>
              </li>
            </ol>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center space-x-3 pt-2">
            <Link href="/settings/discord" className="flex-1">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Bot className="h-4 w-4 mr-2" />
                Discord 연동하기
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            
            {showSkip && (
              <Button variant="outline" onClick={onClose}>
                나중에
              </Button>
            )}
          </div>

          {/* 추가 정보 */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 연동 후 언제든지 설정에서 변경할 수 있습니다
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
