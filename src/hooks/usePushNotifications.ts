import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { customFetch } from '@/lib/requests/customFetch';

interface PushNotificationState {
  isSupported: boolean;
  isPermissionGranted: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}


interface UsePushNotificationsReturn extends PushNotificationState {
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: () => Promise<void>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isPermissionGranted: false,
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  // Service Worker 등록
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          setState(prev => ({ ...prev, isSupported: true }));
        })
        .catch((error) => {
          console.error('Service Worker 등록 실패:', error);
          setState(prev => ({ ...prev, error: 'Service Worker 등록에 실패했습니다' }));
        });
    } else {
      setState(prev => ({ 
        ...prev, 
        isSupported: false,
        error: '브라우저가 푸시 알림을 지원하지 않습니다'
      }));
    }
  }, []);

  // 권한 상태 확인
  useEffect(() => {
    const checkPermissionStatus = async () => {
      try {
        const permission = await Notification.requestPermission();
        setState(prev => ({
          ...prev,
          isPermissionGranted: permission === 'granted'
        }));
      } catch (error) {
        console.error('권한 확인 오류:', error);
        setState(prev => ({ ...prev, error: '권한 확인에 실패했습니다' }));
      }
    };

    if (state.isSupported) {
      checkPermissionStatus();
    }
  }, [state.isSupported]);

  // 구독 상태 확인
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        setState(prev => ({
          ...prev,
          isSubscribed: !!subscription
        }));
      } catch (error) {
        console.error('구독 상태 확인 오류:', error);
      }
    };

    if (state.isSupported && state.isPermissionGranted) {
      checkSubscriptionStatus();
    }
  }, [state.isSupported, state.isPermissionGranted]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      
      setState(prev => ({
        ...prev,
        isPermissionGranted: granted,
        isLoading: false
      }));

      return granted;
    } catch (error) {
      console.error('권한 요청 오류:', error);
      setState(prev => ({
        ...prev,
        error: '권한 요청에 실패했습니다',
        isLoading: false
      }));
      return false;
    }
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isPermissionGranted || !user) {
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID 키 가져오기
      const vapidResponse = await customFetch.getFetch<any, any>({
        url: '/api/notifications/vapid-key'
      });
      
      const vapidKey = vapidResponse.publicKey;

      // 푸시 구독 생성
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as any
      });

      // 서버에 구독 정보 전송
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: arrayBufferToBase64(subscription.getKey('auth'))
        }
      };

      await customFetch.postFetch<any, any>({
        url: '/api/notifications/subscribe',
        body: subscriptionData
      });

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('푸시 구독 오류:', error);
      setState(prev => ({
        ...prev,
        error: '푸시 구독에 실패했습니다',
        isLoading: false
      }));
      return false;
    }
  }, [state.isPermissionGranted, user]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        
        // 서버에서 구독 정보 제거
        await customFetch.postFetch<any, any>({
          url: '/api/notifications/unsubscribe',
          body: { endpoint: subscription.endpoint }
        });
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('푸시 구독 해제 오류:', error);
      setState(prev => ({
        ...prev,
        error: '푸시 구독 해제에 실패했습니다',
        isLoading: false
      }));
      return false;
    }
  }, []);

  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      await customFetch.postFetch<any, any>({
        url: '/api/notifications/test-push',
        body: {}
      });
    } catch (error) {
      console.error('테스트 알림 발송 오류:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// VAPID 키 변환 유틸리티
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ArrayBuffer를 Base64로 변환
function arrayBufferToBase64(buffer: ArrayBuffer | null): string {
  if (!buffer) return '';
  
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
