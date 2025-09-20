import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { customFetch } from '@/lib/requests/customFetch';
import type { 
  NotificationPreferencesResponse,
  NotificationType 
} from '@/types/notifications';

interface NotificationSettings {
  email: boolean;
  browser: boolean;
  taskAssigned: boolean;
  taskDue: boolean;
  taskOverdue: boolean;
  teamInvitation: boolean;
}

interface UseNotificationSettingsReturn {
  settings: NotificationSettings;
  isLoading: boolean;
  error: Error | null;
  updateSetting: (key: keyof NotificationSettings, value: boolean) => void;
  saveSettings: () => Promise<void>;
  isSaving: boolean;
}

// 알림 타입 매핑
const notificationTypeMapping: Record<keyof NotificationSettings, NotificationType[]> = {
  email: [], // 전체 이메일 설정
  browser: [], // 전체 브라우저 설정
  taskAssigned: ['task_assigned'],
  taskDue: ['task_due'],
  taskOverdue: ['task_overdue'],
  teamInvitation: ['team_invitation'],
};

// 기본 설정값
const defaultSettings: NotificationSettings = {
  email: true,
  browser: true,
  taskAssigned: true,
  taskDue: true,
  taskOverdue: true,
  teamInvitation: true,
};

export function useNotificationSettings(): UseNotificationSettingsReturn {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  // 알림 설정 조회
  const { data: preferencesData, isLoading, error } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: async (): Promise<NotificationPreferencesResponse> => {
      const response = await customFetch.getFetch<any, any>({
        url: '/api/notifications/preferences'
      }) as NotificationPreferencesResponse;
      return response;
    },
  });

  // 설정 데이터를 로컬 상태로 변환
  useEffect(() => {
    if (preferencesData?.preferences) {
      const newSettings = { ...defaultSettings };
      
      // 각 알림 타입별 설정 적용
      Object.entries(notificationTypeMapping).forEach(([settingKey, notificationTypes]) => {
        if (notificationTypes.length === 0) {
          // 전체 설정 (email, browser)
          if (settingKey === 'email') {
            newSettings.email = preferencesData.preferences.some(pref => 
              pref.email_enabled === true
            );
          } else if (settingKey === 'browser') {
            newSettings.browser = preferencesData.preferences.some(pref => 
              pref.push_enabled === true
            );
          }
        } else {
          // 특정 알림 타입 설정
          const relevantPreferences = preferencesData.preferences.filter(pref => 
            notificationTypes.includes(pref.type as NotificationType)
          );
          
          if (relevantPreferences.length > 0) {
            // 해당 타입의 알림이 활성화되어 있는지 확인
            const isEnabled = relevantPreferences.some(pref => 
              pref.email_enabled === true || pref.push_enabled === true
            );
            newSettings[settingKey as keyof NotificationSettings] = isEnabled;
          }
        }
      });
      
      setSettings(newSettings);
    }
  }, [preferencesData]);

  // 개별 설정 변경
  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // 설정 저장
  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const promises: Promise<any>[] = [];

      // 각 알림 타입별로 설정 업데이트
      Object.entries(notificationTypeMapping).forEach(([settingKey, notificationTypes]) => {
        if (notificationTypes.length === 0) {
          // 전체 설정 (email, browser) - 모든 알림 타입에 적용
          const allNotificationTypes: NotificationType[] = [
            'task_assigned', 'task_due', 'task_overdue', 'task_completed',
            'task_updated', 'task_comment', 'team_invitation', 'team_member_joined',
            'team_member_left', 'project_created', 'project_updated', 'system', 'mention'
          ];

          allNotificationTypes.forEach(type => {
            const promise = customFetch.postFetch<any, any>({
              url: '/api/notifications/preferences',
              body: {
              type,
              email_enabled: settingKey === 'email' ? settings.email : undefined,
              push_enabled: settingKey === 'browser' ? settings.browser : undefined,
              discord_enabled: false, // 기본값
              in_app_enabled: true, // 기본값
            }
            });
            promises.push(promise);
          });
        } else {
          // 특정 알림 타입 설정
          notificationTypes.forEach(type => {
            const promise = customFetch.postFetch<any, any>({
              url: '/api/notifications/preferences',
              body: {
              type,
              email_enabled: settings.email,
              push_enabled: settings.browser,
              discord_enabled: false, // 기본값
              in_app_enabled: true, // 기본값
            }
            });
            promises.push(promise);
          });
        }
      });

      await Promise.all(promises);

      // 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });

    } catch (error) {
      console.error('알림 설정 저장 오류:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isLoading,
    error: error as Error | null,
    updateSetting,
    saveSettings,
    isSaving,
  };
}
