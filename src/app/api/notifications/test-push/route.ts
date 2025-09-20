import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import webpush from 'web-push';

// VAPID 키 설정
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 사용자의 푸시 구독 조회 (notifications 테이블에서)
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('notifications')
      .select('data')
      .eq('user_id', user.id)
      .eq('type', 'push_subscription');

    if (subscriptionError) {
      console.error('푸시 구독 조회 오류:', subscriptionError);
      return createErrorResponse('푸시 구독 조회에 실패했습니다', 500);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return createErrorResponse('푸시 구독이 없습니다', 400);
    }

    // 테스트 알림 데이터
    const payload = JSON.stringify({
      title: 'Flowra 테스트 알림',
      body: `안녕하세요 ${user.name || user.email}님! 푸시 알림이 정상적으로 작동합니다.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'test-notification',
      data: {
        url: '/dashboard',
        timestamp: Date.now(),
      },
      actions: [
        {
          action: 'open',
          title: '앱 열기',
          icon: '/icons/open.png'
        }
      ]
    });

    // 모든 구독에 푸시 알림 발송
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const { endpoint, keys } = subscription.data as any;
          await webpush.sendNotification(
            {
              endpoint,
              keys: {
                p256dh: keys.p256dh,
                auth: keys.auth,
              },
            },
            payload
          );
          return { success: true, endpoint };
        } catch (error) {
          console.error('푸시 발송 실패:', error);
          return { success: false, endpoint: (subscription.data as any).endpoint, error };
        }
      })
    );

    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    const failCount = results.length - successCount;

    return createSuccessResponse({
      message: `테스트 푸시 알림을 발송했습니다`,
      results: {
        total: results.length,
        success: successCount,
        failed: failCount,
      }
    });
  } catch (error) {
    console.error('테스트 푸시 알림 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
