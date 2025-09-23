'use client';

import { SettingsNavigation } from '../components/SettingsNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { 
  Bell, 
  Mail, 
  Monitor,
  CheckSquare,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function NotificationSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { 
    settings, 
    isLoading, 
    error, 
    updateSetting, 
    saveSettings, 
    isSaving 
  } = useNotificationSettings();

  const {
    isSupported: pushSupported,
    isPermissionGranted: pushPermissionGranted,
    isSubscribed: pushSubscribed,
    isLoading: pushLoading,
    error: pushError,
    requestPermission: requestPushPermission,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    sendTestNotification
  } = usePushNotifications();

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value);
  };

  const handleSave = async () => {
    try {
      await saveSettings();
      toast({
        title: "알림 설정 저장 완료",
        description: "알림 설정이 성공적으로 저장되었습니다.",
      });
    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
      toast({
        title: "저장 실패",
        description: "알림 설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400">알림 설정을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            알림 설정을 불러올 수 없습니다.
          </p>
          <Button onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            알림 설정을 위해 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SettingsNavigation />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              알림 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              알림 방법과 유형을 관리하세요
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Notification Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>알림 방법</span>
                </CardTitle>
                <CardDescription>
                  알림을 받을 방법을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">이메일</p>
                      <p className="text-sm text-gray-500">이메일로 알림을 받습니다</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.email}
                    onCheckedChange={(checked) => handleSettingChange('email', checked)}
                  />
                </div>

                {/* 푸시 알림 설정 */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">푸시 알림</p>
                        <p className="text-sm text-gray-500">브라우저 푸시 알림을 받습니다</p>
                      </div>
                    </div>
                    {pushSupported ? (
                      <Switch
                        checked={pushSubscribed}
                        onCheckedChange={async (checked) => {
                          if (checked) {
                            if (!pushPermissionGranted) {
                              const granted = await requestPushPermission();
                              if (granted) {
                                await subscribePush();
                              }
                            } else {
                              await subscribePush();
                            }
                          } else {
                            await unsubscribePush();
                          }
                        }}
                        disabled={pushLoading}
                      />
                    ) : (
                      <span className="text-sm text-gray-400">지원되지 않음</span>
                    )}
                  </div>
                  
                  {pushSupported && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">권한 상태:</span>
                        <span className={pushPermissionGranted ? "text-green-600" : "text-red-600"}>
                          {pushPermissionGranted ? "허용됨" : "거부됨"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">구독 상태:</span>
                        <span className={pushSubscribed ? "text-green-600" : "text-gray-600"}>
                          {pushSubscribed ? "구독됨" : "구독 안됨"}
                        </span>
                      </div>
                      
                      {pushSubscribed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              await sendTestNotification();
                              toast({
                                title: "테스트 알림 발송",
                                description: "테스트 푸시 알림을 발송했습니다.",
                              });
                            } catch {
                              toast({
                                title: "테스트 알림 실패",
                                description: "테스트 푸시 알림 발송에 실패했습니다.",
                                variant: "destructive",
                              });
                            }
                          }}
                          disabled={pushLoading}
                          className="w-full"
                        >
                          {pushLoading ? "발송 중..." : "테스트 알림 발송"}
                        </Button>
                      )}
                      
                      {pushError && (
                        <p className="text-sm text-red-600">{pushError}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5" />
                  <span>알림 유형</span>
                </CardTitle>
                <CardDescription>
                  받고 싶은 알림 유형을 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">업무 할당</p>
                    <p className="text-sm text-gray-500">새로운 업무가 할당되었을 때</p>
                  </div>
                  <Switch
                    checked={settings.taskAssigned}
                    onCheckedChange={(checked) => handleSettingChange('taskAssigned', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">업무 마감일</p>
                    <p className="text-sm text-gray-500">업무 마감일이 다가올 때</p>
                  </div>
                  <Switch
                    checked={settings.taskDue}
                    onCheckedChange={(checked) => handleSettingChange('taskDue', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">업무 지연</p>
                    <p className="text-sm text-gray-500">업무가 지연되었을 때</p>
                  </div>
                  <Switch
                    checked={settings.taskOverdue}
                    onCheckedChange={(checked) => handleSettingChange('taskOverdue', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">팀 초대</p>
                    <p className="text-sm text-gray-500">새로운 팀에 초대받았을 때</p>
                  </div>
                  <Switch
                    checked={settings.teamInvitation}
                    onCheckedChange={(checked) => handleSettingChange('teamInvitation', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>저장 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Bell className="h-4 w-4" />
                    <span>설정 저장</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}