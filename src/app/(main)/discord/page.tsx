"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
  Bot,
  Server,
  Hash,
  RefreshCw,
  Trash2,
  Settings,
  Wifi,
  WifiOff,
  TestTube
} from "lucide-react";
import { customFetch } from "@/lib/requests/customFetch";

interface DiscordStatus {
  connected: boolean;
  guild?: {
    id: string;
    name: string;
    icon?: string;
    memberCount?: number;
  };
  channel?: {
    id: string;
    name: string;
    type?: number;
  };
  botPermissions?: string[];
  message?: string;
}


export default function DiscordPage() {
  const { currentTeam } = useAuth();
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<{
    reminder_time: string;
    timezone: string;
    reminder_enabled: boolean;
  } | null>(null);


  // Discord 봇 테스트 상태
  const [isBotTestLoading, setIsBotTestLoading] = useState(false);
  const [botTestResult, setBotTestResult] = useState<any>(null);
  const [botTestForm, setBotTestForm] = useState({
    type: 'reminder',
    taskId: '',
  });

  // 연결 폼 상태
  const [connectionForm, setConnectionForm] = useState({
    guildId: '',
    channelId: '',
  });

  const checkDiscordStatus = useCallback(async () => {
    if (!currentTeam?.id) return;

    setIsChecking(true);
    setError(null);

    try {
      // Discord 스케줄러 초기화 (백그라운드에서 실행)
      await customFetch.getFetch({ url: '/api/discord/init' }).catch(console.error);
      
      const response = await customFetch.getFetch<{ data: DiscordStatus }, any>({
        url: `/api/discord/status?teamId=${currentTeam.id}`,
      });

      if (response.data) {
        setDiscordStatus(response.data);
      }
    } catch (error) {
      console.error('Discord 상태 확인 오류:', error);
      setError('Discord 상태를 확인할 수 없습니다.');
    } finally {
      setIsChecking(false);
    }
  }, [currentTeam?.id]);

  useEffect(() => {
    if (currentTeam?.id) {
      checkDiscordStatus();
      checkUserSettings();
    }
  }, [currentTeam?.id, checkDiscordStatus]);

  const handleConnect = async () => {
    if (!currentTeam?.id) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await customFetch.postFetch<any, any>({
        url: '/api/discord/connect',
        body: {
          team_id: currentTeam.id,
          guild_id: connectionForm.guildId,
          channel_id: connectionForm.channelId,
        },
      });

      if (response.data) {
        setSuccess('Discord 봇이 성공적으로 연결되었습니다!');
        setConnectionForm({ guildId: '', channelId: '' });
        await checkDiscordStatus();
      }
    } catch (error: any) {
      console.error('Discord 연결 오류:', error);
      setError(error.message || 'Discord 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!currentTeam?.id) return;

    if (!confirm('Discord 봇 연결을 해제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await customFetch.deleteFetch<any, any>({
        url: `/api/discord/status?teamId=${currentTeam.id}`,
      });

      if (response.data) {
        setSuccess('Discord 봇 연결이 해제되었습니다.');
        setDiscordStatus(null);
      }
    } catch (error: any) {
      console.error('Discord 연결 해제 오류:', error);
      setError(error.message || 'Discord 연결 해제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkUserSettings = async () => {
    try {
      const response = await customFetch.getFetch<{ data: any }, any>({
        url: '/api/discord/user-settings',
      });

      if (response.data) {
        setUserSettings(response.data);
      }
    } catch (error) {
      console.error('사용자 설정 확인 오류:', error);
    }
  };

  const handleSaveUserSettings = async () => {
    if (!userSettings) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await customFetch.postFetch<any, any>({
        url: '/api/discord/user-settings',
        body: userSettings,
      });

      if (response.data) {
        setSuccess('개인 설정이 저장되었습니다.');
        await checkUserSettings();
      }
    } catch (error: any) {
      console.error('사용자 설정 저장 오류:', error);
      setError(error.message || '설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };


  // Discord 봇 테스트 핸들러
  const handleBotTestNotification = async () => {
    if (!currentTeam?.id) return;

    setIsBotTestLoading(true);
    setBotTestResult(null);
    setError(null);

    try {
      const response = await customFetch.postFetch<any, any>({
        url: '/api/discord/bot-with-buttons',
        body: {
          team_id: currentTeam.id,
          type: botTestForm.type,
          task_id: botTestForm.taskId || undefined,
        },
      });

      if (response.data) {
        setBotTestResult({
          success: true,
          message: response.data.message || 'Discord 봇 테스트 알림이 발송되었습니다.',
          taskId: response.data.task_id || response.data.taskId,
          channelId: response.data.channel_id,
          guildId: response.data.guild_id,
          hasButtons: response.data.has_buttons,
          botReady: response.data.bot_ready,
        });
        setSuccess('Discord 봇 테스트 알림이 성공적으로 발송되었습니다!');
      }
    } catch (error: any) {
      console.error('Discord 봇 테스트 발송 오류:', error);
      setBotTestResult({
        success: false,
        message: error.message || 'Discord 봇 테스트 발송에 실패했습니다.',
      });
      setError(error.message || 'Discord 봇 테스트 발송에 실패했습니다.');
    } finally {
      setIsBotTestLoading(false);
    }
  };

  // 인터랙션 테스트 함수

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'SendMessages':
        return '💬';
      case 'EmbedLinks':
        return '🔗';
      case 'ReadMessageHistory':
        return '📖';
      case 'AddReactions':
        return '👍';
      default:
        return '✅';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 */}
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
            
            {/* 연결 상태 표시 */}
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

        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* 연결 상태 개요 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* 연결 상태 카드 */}
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">연결 상태</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {discordStatus?.connected ? '연결됨' : '연결 안됨'}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${discordStatus?.connected ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                      {discordStatus?.connected ? (
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 서버 정보 카드 */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Discord 서버</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {discordStatus?.guild?.name || '연결 안됨'}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                      <Server className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 채널 정보 카드 */}
              <Card className="border-l-4 border-l-purple-500">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">알림 채널</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {discordStatus?.channel ? `#${discordStatus.channel.name}` : '설정 안됨'}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                      <Hash className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 상세 정보 섹션 */}
            {discordStatus && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 서버 상세 정보 */}
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
                          <h3 className="font-semibold text-gray-900 dark:text-white">{discordStatus.guild.name}</h3>
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

                {/* 채널 및 권한 정보 */}
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
                          <p className="font-medium text-gray-900 dark:text-white">#{discordStatus.channel.name}</p>
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
            )}

            {/* 액션 버튼들 */}
            {discordStatus && (
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
                      onClick={checkDiscordStatus}
                      disabled={isChecking}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                      상태 새로고침
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisconnect}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      연결 해제
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

      {/* 연결 폼 */}
      {!discordStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Discord 봇 연결
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Discord 봇을 연결하려면 다음 정보가 필요합니다:
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Discord 서버 ID (Guild ID)</li>
                  <li>텍스트 채널 ID</li>
                </ul>
                <a 
                  href="https://discord.com/developers/applications" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800"
                >
                  Discord 개발자 포털에서 봇 생성하기
                  <ExternalLink className="h-3 w-3" />
                </a>
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="guildId">Discord 서버 ID</Label>
                <Input
                  id="guildId"
                  type="text"
                  placeholder="서버 ID를 입력하세요"
                  value={connectionForm.guildId}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, guildId: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="channelId">채널 ID</Label>
                <Input
                  id="channelId"
                  type="text"
                  placeholder="채널 ID를 입력하세요"
                  value={connectionForm.channelId}
                  onChange={(e) => setConnectionForm(prev => ({ ...prev, channelId: e.target.value }))}
                />
              </div>


              <Button 
                onClick={handleConnect}
                disabled={isLoading || !connectionForm.guildId || !connectionForm.channelId}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    연결 중...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Discord 봇 연결
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}



      {/* 개인 리마인드 설정 */}
      {discordStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-purple-600" />
              개인 리마인드 설정
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="reminderTime">리마인드 시간</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={userSettings?.reminder_time || '09:00'}
                  onChange={(e) => setUserSettings(prev => prev ? { ...prev, reminder_time: e.target.value } : null)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  매일 이 시간에 내일 마감인 업무를 Discord로 알려드립니다.
                </p>
              </div>

              <div>
                <Label htmlFor="timezone">시간대</Label>
                <select
                  id="timezone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={userSettings?.timezone || 'Asia/Seoul'}
                  onChange={(e) => setUserSettings(prev => prev ? { ...prev, timezone: e.target.value } : null)}
                >
                  <option value="Asia/Seoul">한국 표준시 (KST)</option>
                  <option value="America/New_York">동부 표준시 (EST)</option>
                  <option value="America/Los_Angeles">태평양 표준시 (PST)</option>
                  <option value="Europe/London">그리니치 표준시 (GMT)</option>
                  <option value="Europe/Berlin">중앙 유럽 표준시 (CET)</option>
                  <option value="Asia/Tokyo">일본 표준시 (JST)</option>
                  <option value="Asia/Shanghai">중국 표준시 (CST)</option>
                  <option value="Australia/Sydney">호주 동부 표준시 (AEST)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={userSettings?.reminder_enabled !== false}
                  onChange={(e) => setUserSettings(prev => prev ? { ...prev, reminder_enabled: e.target.checked } : null)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="reminderEnabled">개인 리마인드 활성화</Label>
              </div>

              <Button 
                onClick={handleSaveUserSettings}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4 mr-2" />
                    설정 저장
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discord 봇 테스트 (실제 버튼) */}
      {process.env.NODE_ENV === 'development' && discordStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-blue-600" />
              Discord 봇 테스트 (실제 버튼)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Discord 봇이 설정된 경우 실제 인터랙티브 버튼이 포함된 알림을 테스트할 수 있습니다.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="botTestType">알림 유형</Label>
                <Select value={botTestForm.type} onValueChange={(value) => setBotTestForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="알림 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reminder">리마인드 알림</SelectItem>
                    <SelectItem value="due_date">마감일 알림</SelectItem>
                    <SelectItem value="overdue">연체 알림</SelectItem>
                    <SelectItem value="completed">완료 알림</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="botTestTaskId">업무 ID (선택사항)</Label>
                <Input
                  id="botTestTaskId"
                  type="text"
                  placeholder="테스트할 업무 ID를 입력하세요"
                  value={botTestForm.taskId}
                  onChange={(e) => setBotTestForm(prev => ({ ...prev, taskId: e.target.value }))}
                />
              </div>

              <Button 
                onClick={handleBotTestNotification}
                disabled={isBotTestLoading || !botTestForm.type}
                className="w-full"
              >
                {isBotTestLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    봇 테스트 중...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Discord 봇 테스트 발송
                  </>
                )}
              </Button>
            </div>

            {/* 봇 테스트 결과 - 개선된 UI */}
            {botTestResult && (
              <div className="mt-6 space-y-4">
                {/* 결과 카드 */}
                <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  botTestResult.success 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                    : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      botTestResult.success 
                        ? 'bg-green-100 dark:bg-green-900/40' 
                        : 'bg-red-100 dark:bg-red-900/40'
                    }`}>
                      {botTestResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-lg mb-1">
                        {botTestResult.success ? '🎉 테스트 성공!' : '❌ 테스트 실패'}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {botTestResult.message}
                      </p>
                      
                      {botTestResult.success && (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                            <span className="font-medium text-gray-500 dark:text-gray-400">업무 ID</span>
                            <p className="font-mono text-gray-900 dark:text-white">{botTestResult.taskId}</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                            <span className="font-medium text-gray-500 dark:text-gray-400">채널 ID</span>
                            <p className="font-mono text-gray-900 dark:text-white">{botTestResult.channelId}</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                            <span className="font-medium text-gray-500 dark:text-gray-400">서버 ID</span>
                            <p className="font-mono text-gray-900 dark:text-white">{botTestResult.guildId}</p>
                          </div>
                          <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                            <span className="font-medium text-gray-500 dark:text-gray-400">봇 상태</span>
                            <p className="flex items-center gap-1">
                              {botTestResult.botReady ? (
                                <>
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  온라인
                                </>
                              ) : (
                                <>
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  오프라인
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 디버깅 정보 */}
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                    <span className="group-open:rotate-90 transition-transform">▶</span>
                    고급 디버깅 정보 보기
                  </summary>
                  <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                      {JSON.stringify(botTestResult, null, 2)}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

            {/* 알림 메시지 */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
