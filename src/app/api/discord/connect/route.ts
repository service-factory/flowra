import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

const connectDiscordSchema = z.object({
  team_id: z.string().min(1, '팀 ID가 필요합니다'),
  guild_id: z.string().min(1, 'Discord 서버 ID가 필요합니다'),
  channel_id: z.string().min(1, 'Discord 채널 ID가 필요합니다'),
});

/**
 * POST /api/discord/connect
 * Discord 봇을 팀에 연결
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = connectDiscordSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        '잘못된 요청 데이터입니다.',
        400
      );
    }

    const { team_id, guild_id, channel_id } = validationResult.data;

    // 인증 및 팀 권한 확인 (관리자 권한 필요)
    const authResult = await authenticateWithTeam(request, team_id, ['admin']);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    try {
      // Discord 봇 설정 저장
      const { error } = await supabase
        .from('teams')
        .update({
          discord_guild_id: guild_id,
          discord_channel_id: channel_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', team_id);

      if (error) {
        console.error('Discord 봇 설정 저장 실패:', error);
        return createErrorResponse('Discord 봇 설정 저장에 실패했습니다.', 500);
      }

      return createSuccessResponse({
        message: 'Discord 봇이 성공적으로 연결되었습니다.',
        guild: {
          id: guild_id,
          name: 'Discord 서버',
        },
        channel: {
          id: channel_id,
          name: 'Discord 채널',
        },
      });

    } catch (error) {
      console.error('Discord 연결 오류:', error);
      return createErrorResponse('Discord 연결 중 오류가 발생했습니다.', 500);
    }

  } catch (error) {
    console.error('Discord 연결 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

/**
 * DELETE /api/discord/connect
 * Discord 봇 연결 해제
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { team_id } = z.object({ team_id: z.string() }).parse(body);

    // 인증 및 팀 권한 확인 (관리자 권한 필요)
    const authResult = await authenticateWithTeam(request, team_id, ['admin']);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { supabase } = authResult;
    if (!supabase) {
      return createErrorResponse('데이터베이스 연결 오류', 500);
    }

    try {
      // Discord 봇 설정 제거
      const { error } = await supabase
        .from('teams')
        .update({
          discord_guild_id: null,
          discord_channel_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', team_id);

      if (error) {
        console.error('Discord 봇 설정 제거 실패:', error);
        return createErrorResponse('Discord 봇 설정 제거에 실패했습니다.', 500);
      }

      return createSuccessResponse({
        message: 'Discord 봇 연결이 해제되었습니다.',
      });

    } catch (error) {
      console.error('Discord 연결 해제 오류:', error);
      return createErrorResponse('Discord 연결 해제 중 오류가 발생했습니다.', 500);
    }

  } catch (error) {
    console.error('Discord 연결 해제 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}