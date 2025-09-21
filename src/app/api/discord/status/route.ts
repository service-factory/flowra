import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';

/**
 * GET /api/discord/status
 * Discord 봇 연결 상태 조회
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const teamId = url.searchParams.get('teamId') || url.searchParams.get('team_id');

    if (!teamId) {
      return createErrorResponse('팀 ID가 필요합니다.', 400);
    }

    // 인증 및 팀 권한 확인
    const authResult = await authenticateWithTeam(request, teamId);
    if (!authResult.success) {
      return authResult.error!;
    }

    try {
      const { supabase } = authResult;
      if (!supabase) {
        return createErrorResponse('데이터베이스 연결 오류', 500);
      }

      // Discord 봇 설정 조회
      const { data: team, error } = await supabase
        .from('teams')
        .select('discord_guild_id, discord_channel_id')
        .eq('id', teamId)
        .single();
      
      if (error || !team) {
        return createSuccessResponse({
          connected: false,
          guild: null,
          channel: null,
          botPermissions: [],
          message: 'Discord 봇이 연결되지 않았습니다.',
        });
      }

      if (!team.discord_guild_id || !team.discord_channel_id) {
        return createSuccessResponse({
          connected: false,
          guild: null,
          channel: null,
          botPermissions: [],
          message: 'Discord 봇이 연결되지 않았습니다.',
        });
      }

      return createSuccessResponse({
        connected: true,
        guild: {
          id: team.discord_guild_id,
          name: 'Discord 서버',
        },
        channel: {
          id: team.discord_channel_id,
          name: 'Discord 채널',
        },
        botPermissions: [
          'Send Messages',
          'Embed Links',
          'Read Message History',
          'Use Slash Commands',
          'Add Reactions',
          'Manage Messages'
        ],
        message: 'Discord 봇이 연결되었습니다.',
      });

    } catch (error) {
      console.error('Discord 상태 확인 오류:', error);
      return createErrorResponse('Discord 상태 확인 중 오류가 발생했습니다.', 500);
    }

  } catch (error) {
    console.error('Discord 상태 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}