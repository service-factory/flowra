'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useToast } from '@/hooks/use-toast';
import type { Notification } from '@/types/notifications';
import { Bell } from 'lucide-react';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => void;
  showToast: (notification: Notification) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [toastNotifications, setToastNotifications] = useState<Notification[]>([]);

  // 새 알림 토스트 표시
  const showToast = useCallback((notification: Notification) => {
    // 이미 표시된 알림인지 확인
    if (toastNotifications.some(n => n.id === notification.id)) {
      return;
    }

    // 토스트 알림 추가
    setToastNotifications(prev => [...prev, notification]);

    // 토스트 표시
    toast({
      title: notification.title,
      description: notification.content || undefined,
    });

    // 5초 후 자동 제거
    setTimeout(() => {
      setToastNotifications(prev => 
        prev.filter(n => n.id !== notification.id)
      );
    }, 5000);
  }, [toast, toastNotifications]);

  // 새 알림 수신 콜백
  const handleNewNotification = useCallback((notification: Notification) => {
    showToast(notification);
  }, [showToast]);

  // 알림 읽음 처리 콜백
  const handleNotificationRead = useCallback((notificationId: string) => {
    console.log('📖 알림 읽음 처리:', notificationId);
  }, []);

  // 실시간 알림 훅 사용
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useRealtimeNotifications({
    userId: user?.id || '',
    enabled: !!user,
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
  });

  // 브라우저 탭 제목에 읽지 않은 알림 개수 표시
  useEffect(() => {
    if (unreadCount > 0) {
      document.title = `(${unreadCount}) Flowra`;
    } else {
      document.title = 'Flowra';
    }

    // 컴포넌트 언마운트 시 원래 제목으로 복원
    return () => {
      document.title = 'Flowra';
    };
  }, [unreadCount]);

  // 브라우저 알림 권한 요청
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);


  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
    showToast,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* 실시간 알림 상태 표시 (개발용) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg z-50">
          <div className="flex items-center space-x-2 text-sm">
            <Bell className="h-4 w-4 text-blue-600" />
            <span className="font-medium">알림</span>
            <span className="text-gray-500">({unreadCount})</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
}
