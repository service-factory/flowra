import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { discordUserSettingsService } from '@/lib/services/discord/discordUserSettings';
import { z } from 'zod';

const userSettingsSchema = z.object({
  reminder_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'HH:MM 형식으로 입력해주세요'),
  timezone: z.string().min(1, '시간대를 선택해주세요'),
  reminder_enabled: z.boolean().optional(),
});

/**
 * GET /api/discord/user-settings
 * Discord 사용자 설정 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const userId = authResult.user!.id;

    // 사용자 설정 조회
    const settings = await discordUserSettingsService.getUserSettings(userId);

    if (!settings) {
      // 기본 설정 반환
      return createSuccessResponse({
        reminder_time: '09:00',
        timezone: 'Asia/Seoul',
        reminder_enabled: true,
      });
    }

    return createSuccessResponse(settings);

  } catch (error) {
    console.error('Discord 사용자 설정 조회 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

/**
 * POST /api/discord/user-settings
 * Discord 사용자 설정 저장/업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = userSettingsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        '잘못된 요청 데이터입니다.',
        400
      );
    }

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const userId = authResult.user!.id;
    const settings = validationResult.data;

    // 사용자 설정 저장/업데이트
    const updatedSettings = await discordUserSettingsService.updateUserSettings(userId, settings);

    if (!updatedSettings) {
      return createErrorResponse('설정 저장에 실패했습니다.', 500);
    }

    return createSuccessResponse({
      message: 'Discord 설정이 저장되었습니다.',
      settings: updatedSettings,
    });

  } catch (error) {
    console.error('Discord 사용자 설정 저장 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

/**
 * DELETE /api/discord/user-settings
 * Discord 사용자 설정 삭제
 */
export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const userId = authResult.user!.id;

    // 사용자 설정 삭제
    const success = await discordUserSettingsService.deleteUserSettings(userId);

    if (!success) {
      return createErrorResponse('설정 삭제에 실패했습니다.', 500);
    }

    return createSuccessResponse({
      message: 'Discord 설정이 삭제되었습니다.',
    });

  } catch (error) {
    console.error('Discord 사용자 설정 삭제 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}
