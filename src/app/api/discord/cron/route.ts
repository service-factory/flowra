import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth/middleware';

/**
 * GET /api/discord/cron
 * - Vercel Cron 또는 외부 스케줄러에서 호출하여 리마인더/예약 작업 실행
 */
export async function GET(_request: NextRequest) {
  try {
    const { discordWebhookScheduler } = await import('@/lib/services/discord/discordWebhookScheduler');

    // 리마인더 틱 실행 (분 단위로 호출해도 안전)
    await discordWebhookScheduler['checkAndSendReminders' as keyof typeof discordWebhookScheduler]?.call(discordWebhookScheduler);
    // 예약 작업 실행 (마감/연체/완료)
    // private 메서드이므로 퍼블릭 래퍼가 없을 경우 start에서 커버, 여긴 간단히 반환

    return createSuccessResponse({ ok: true, message: 'Cron tick executed' });
  } catch (error) {
    console.error('Discord cron 실행 오류:', error);
    return createErrorResponse('Cron 실행 중 오류', 500);
  }
}


