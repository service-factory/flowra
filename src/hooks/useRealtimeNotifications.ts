import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { customFetch } from '@/lib/requests/customFetch';
import type { 
  Notification, 
  NotificationListResponse
} from '@/types/notifications';

interface UseRealtimeNotificationsOptions {
  userId: string;
  enabled?: boolean;
  onNewNotification?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: string) => void;
}

interface UseRealtimeNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
}

export function useRealtimeNotifications({
  userId,
  enabled = true,
  onNewNotification,
  onNotificationRead,
}: UseRealtimeNotificationsOptions): UseRealtimeNotificationsReturn {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const subscriptionRef = useRef<any>(null);

  // 알림 목록 조회
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async (): Promise<NotificationListResponse> => {
      const response = await customFetch.getFetch<any, any>({
        url: '/api/notifications',
        queryParam: {
          page: 1,
          limit: 50,
        }
      }) as NotificationListResponse;
      return response;
    },
    enabled: enabled && !!userId,
    refetchInterval: 30000, // 30초마다 폴링 (백업용)
  });

  // 실시간 구독 설정
  useEffect(() => {
    if (!enabled || !userId) return;

    // 기존 구독 해제
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    // 새로운 알림 구독
    subscriptionRef.current = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🆕 새로운 알림 수신:', payload);
          
          const newNotification = payload.new as Notification;
          
          // 캐시 업데이트
          queryClient.setQueryData(['notifications', userId], (oldData: NotificationListResponse | undefined) => {
            if (!oldData) return oldData;
            
            return {
              ...oldData,
              notifications: [newNotification, ...oldData.notifications],
              unread_count: oldData.unread_count + 1,
              total_count: oldData.total_count + 1,
            };
          });

          // 새 알림 콜백 호출
          if (onNewNotification) {
            onNewNotification(newNotification);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('📝 알림 업데이트:', payload);
          
          const updatedNotification = payload.new as Notification;
          
          // 캐시 업데이트
          queryClient.setQueryData(['notifications', userId], (oldData: NotificationListResponse | undefined) => {
            if (!oldData) return oldData;
            
            const updatedNotifications = oldData.notifications.map(notification =>
              notification.id === updatedNotification.id ? updatedNotification : notification
            );
            
            // 읽음 처리된 경우 unread_count 감소
            const unreadCountChange = payload.old.is_read !== updatedNotification.is_read 
              ? (updatedNotification.is_read ? -1 : 1) 
              : 0;
            
            return {
              ...oldData,
              notifications: updatedNotifications,
              unread_count: Math.max(0, oldData.unread_count + unreadCountChange),
            };
          });

          // 읽음 처리 콜백 호출
          if (updatedNotification.is_read && onNotificationRead) {
            onNotificationRead(updatedNotification.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🗑️ 알림 삭제:', payload);
          
          const deletedNotification = payload.old as Notification;
          
          // 캐시 업데이트
          queryClient.setQueryData(['notifications', userId], (oldData: NotificationListResponse | undefined) => {
            if (!oldData) return oldData;
            
            const filteredNotifications = oldData.notifications.filter(
              notification => notification.id !== deletedNotification.id
            );
            
            const unreadCountChange = deletedNotification.is_read ? 0 : -1;
            
            return {
              ...oldData,
              notifications: filteredNotifications,
              unread_count: Math.max(0, oldData.unread_count + unreadCountChange),
              total_count: Math.max(0, oldData.total_count - 1),
            };
          });
        }
      )
      .subscribe();

    // 정리 함수
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [enabled, userId, supabase, queryClient, onNewNotification, onNotificationRead]);

  // 알림 읽음 처리
  const markAsRead = async (notificationId: string) => {
    try {
      await customFetch.patchFetch<any, any>({
        url: `/api/notifications/${notificationId}`,
        body: {
          is_read: true,
        }
      });
    } catch (error) {
      console.error('알림 읽음 처리 오류:', error);
      throw error;
    }
  };

  // 모든 알림 읽음 처리
  const markAllAsRead = async () => {
    try {
      // 읽지 않은 알림들만 필터링
      const unreadNotifications = data?.notifications.filter(n => !n.is_read) || [];
      
      // 병렬로 모든 알림 읽음 처리
      await Promise.all(
        unreadNotifications.map(notification => 
          markAsRead(notification.id)
        )
      );
    } catch (error) {
      console.error('모든 알림 읽음 처리 오류:', error);
      throw error;
    }
  };

  // 새로고침
  const refresh = () => {
    refetch();
  };

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unread_count || 0,
    isLoading,
    error: error as Error | null,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
