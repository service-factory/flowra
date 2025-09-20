import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

const unsubscribeSchema = z.object({
  endpoint: z.string().url('유효한 endpoint URL이 필요합니다'),
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
    const validationResult = unsubscribeSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('올바른 구독 정보를 입력하세요', 400);
    }

    const { endpoint } = validationResult.data;

    // 구독 삭제 (notifications 테이블에서)
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id)
      .eq('type', 'push_subscription')
      .like('content', `%${endpoint}%`);

    if (deleteError) {
      console.error('푸시 구독 삭제 오류:', deleteError);
      return createErrorResponse('푸시 구독 삭제에 실패했습니다', 500);
    }

    return createSuccessResponse({ message: '푸시 구독이 성공적으로 해제되었습니다' });
  } catch (error) {
    console.error('푸시 구독 해제 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
