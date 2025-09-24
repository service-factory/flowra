import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth/middleware';

/**
 * GET /api/discord/cron
 * - Vercel Cron 또는 외부 스케줄러에서 호출하여 리마인더/예약 작업 실행
 */
export async function GET(request: NextRequest) {
  try {
    const { discordWebhookScheduler } = await import('@/lib/services/discord/discordWebhookScheduler');
    const { initializeDiscordBot } = await import('@/lib/services/discord/discordBotService');

    // 서버리스 환경에서 매 호출 시 봇 초기화 보장
    await initializeDiscordBot();

    // 팀 스코프 필터 (옵션): ?teamId=...
    const teamId = new URL(request.url).searchParams.get('teamId') || undefined;

    // 리마인더 틱 실행 및 예약 작업 즉시 실행
    await discordWebhookScheduler.tickReminders(teamId);
    await discordWebhookScheduler.runAllNow(teamId);

    return createSuccessResponse({ ok: true, message: 'Cron tick executed' });
  } catch (error) {
    console.error('Discord cron 실행 오류:', error);
    return createErrorResponse('Cron 실행 중 오류', 500);
  }
}


