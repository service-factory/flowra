import { createSuccessResponse, createErrorResponse } from '@/lib/auth/middleware';

/**
 * GET /api/discord/init
 * 서버 시작 시 Discord 스케줄러 자동 초기화
 * 이 엔드포인트는 서버가 시작될 때 자동으로 호출되어야 합니다.
 */
export async function GET() {
  try {
    // Discord 스케줄러 초기화 함수 import
    const { initializeDiscordScheduler } = await import('@/lib/services/discord/discordSchedulerInit');
    
    // 스케줄러 초기화 실행
    await initializeDiscordScheduler();
    
    return createSuccessResponse({
      message: 'Discord 웹훅 스케줄러가 초기화되었습니다.',
      status: 'initialized',
      autoStarted: true,
    });

  } catch (error) {
    console.error('Discord 스케줄러 초기화 오류:', error);
    return createErrorResponse('Discord 스케줄러 초기화에 실패했습니다.', 500);
  }
}

/**
 * POST /api/discord/init
 * 수동으로 Discord 스케줄러 초기화
 */
export async function POST() {
  try {
    const { discordWebhookScheduler } = await import('@/lib/services/discord/discordWebhookScheduler');
    
    // 강제로 스케줄러 재시작
    discordWebhookScheduler.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    discordWebhookScheduler.start();
    
    return createSuccessResponse({
      message: 'Discord 웹훅 스케줄러가 재시작되었습니다.',
      status: 'restarted',
      autoStarted: true,
    });

  } catch (error) {
    console.error('Discord 스케줄러 재시작 오류:', error);
    return createErrorResponse('Discord 스케줄러 재시작에 실패했습니다.', 500);
  }
}
