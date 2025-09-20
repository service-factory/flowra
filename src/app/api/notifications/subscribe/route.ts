import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

const subscribeSchema = z.object({
  endpoint: z.string().url('유효한 endpoint URL이 필요합니다'),
  keys: z.object({
    p256dh: z.string().min(1, 'p256dh 키가 필요합니다'),
    auth: z.string().min(1, 'auth 키가 필요합니다'),
  }),
});

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

    // 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validationResult = subscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('올바른 구독 정보를 입력하세요', 400);
    }

    const { endpoint, keys } = validationResult.data;

    // 기존 구독 확인 (임시로 notifications 테이블 사용)
    const { data: existingSubscription } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'push_subscription')
      .single();

    // 푸시 구독 정보를 notifications 테이블에 저장 (임시)
    const subscriptionData = {
      user_id: user.id,
      type: 'push_subscription' as const,
      title: '푸시 구독',
      content: `푸시 알림 구독: ${endpoint}`,
      data: {
        endpoint,
        keys,
        subscription_type: 'push_notification'
      },
      is_read: true,
    };

    if (existingSubscription) {
      // 기존 구독 업데이트
      const { error: updateError } = await supabase
        .from('notifications')
        .update(subscriptionData)
        .eq('id', existingSubscription.id);

      if (updateError) {
        console.error('푸시 구독 업데이트 오류:', updateError);
        return createErrorResponse('푸시 구독 업데이트에 실패했습니다', 500);
      }
    } else {
      // 새 구독 생성
      const { error: insertError } = await supabase
        .from('notifications')
        .insert(subscriptionData);

      if (insertError) {
        console.error('푸시 구독 생성 오류:', insertError);
        return createErrorResponse('푸시 구독 생성에 실패했습니다', 500);
      }
    }

    return createSuccessResponse({ message: '푸시 구독이 성공적으로 등록되었습니다' });
  } catch (error) {
    console.error('푸시 구독 등록 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
