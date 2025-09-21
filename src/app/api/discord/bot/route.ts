import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

const botActionSchema = z.object({
  action: z.enum(['start', 'stop', 'status', 'test']),
  teamId: z.string().optional(),
});

/**
 * POST /api/discord/bot
 * Discord 웹훅 스케줄러 관리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = botActionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        '잘못된 요청 데이터입니다.',
        400
      );
    }

    const { action, teamId } = validationResult.data;

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    try {
      switch (action) {
        case 'start':
          return await handleStartScheduler();
        case 'stop':
          return await handleStopScheduler();
        case 'status':
          return await handleSchedulerStatus();
        case 'test':
          if (!teamId) {
            return createErrorResponse('teamId가 필요합니다.', 400);
          }
          return await handleTestWebhook(teamId);
        default:
          return createErrorResponse('지원하지 않는 액션입니다.', 400);
      }
    } catch (error) {
      console.error('Discord 봇 관리 오류:', error);
      return createErrorResponse('봇 관리 중 오류가 발생했습니다.', 500);
    }

  } catch (error) {
    console.error('Discord 봇 관리 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

/**
 * 스케줄러 시작
 */
async function handleStartScheduler() {
  try {
    const { discordWebhookScheduler } = await import('@/lib/services/discord/discordWebhookScheduler');
    discordWebhookScheduler.start();
    
    return createSuccessResponse({
      message: 'Discord 웹훅 스케줄러가 시작되었습니다.',
      status: 'started',
    });
  } catch (error) {
    console.error('스케줄러 시작 오류:', error);
    return createErrorResponse('스케줄러 시작에 실패했습니다.', 500);
  }
}

/**
 * 스케줄러 중지
 */
async function handleStopScheduler() {
  try {
    const { discordWebhookScheduler } = await import('@/lib/services/discord/discordWebhookScheduler');
    discordWebhookScheduler.stop();
    
    return createSuccessResponse({
      message: 'Discord 웹훅 스케줄러가 중지되었습니다.',
      status: 'stopped',
    });
  } catch (error) {
    console.error('스케줄러 중지 오류:', error);
    return createErrorResponse('스케줄러 중지에 실패했습니다.', 500);
  }
}

/**
 * 스케줄러 상태 확인
 */
async function handleSchedulerStatus() {
  try {
    const { discordWebhookScheduler } = await import('@/lib/services/discord/discordWebhookScheduler');
    const status = discordWebhookScheduler.getStatus();
    
    return createSuccessResponse({
      status: status.isRunning ? 'running' : 'stopped',
      isRunning: status.isRunning,
      intervalId: status.intervalId,
      reminderIntervalId: status.reminderIntervalId,
      message: status.message,
    });
  } catch (error) {
    console.error('스케줄러 상태 확인 오류:', error);
    return createErrorResponse('스케줄러 상태 확인에 실패했습니다.', 500);
  }
}

/**
 * 웹훅 테스트
 */
async function handleTestWebhook(teamId: string) {
  try {
    const { discordWebhookService } = await import('@/lib/services/discord/discordWebhookService');
    
    // 팀 Discord 설정 조회
    const config = await discordWebhookService.getTeamConfig(teamId);
    
    if (!config) {
      return createErrorResponse('Discord 설정이 없습니다.', 404);
    }

    // 테스트 메시지 발송
    const testSuccess = await discordWebhookService.sendTestMessage(config.webhookUrl);

    if (!testSuccess) {
      return createErrorResponse('웹훅 테스트에 실패했습니다.', 500);
    }

    return createSuccessResponse({
      message: 'Discord 웹훅 테스트가 성공적으로 완료되었습니다.',
      testResult: 'success',
      connected: true,
    });

  } catch (error) {
    console.error('웹훅 테스트 오류:', error);
    return createErrorResponse('웹훅 테스트에 실패했습니다.', 500);
  }
}