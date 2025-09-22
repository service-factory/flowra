import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, authenticateWithTeam } from '@/lib/auth/middleware';
import { createServiceClient } from '@/lib/supabase/server';
import { initializeDiscordBot } from '@/lib/services/discord/discordBotService';
import { z } from 'zod';

const botStatusSchema = z.object({
  team_id: z.string().min(1, '팀 ID가 필요합니다'),
});

/**
 * POST /api/discord/bot-status
 * Discord 봇 상태 확인 및 설정
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = botStatusSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        `입력 데이터가 유효하지 않습니다: ${validationResult.error.issues.map(e => e.message).join(', ')}`,
        400
      );
    }

    const { team_id } = validationResult.data;

    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    // Supabase 클라이언트 생성
    const supabase = createServiceClient();

    // 팀 정보 조회
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, discord_guild_id, discord_channel_id, discord_webhook_url')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return createErrorResponse('팀 정보를 가져올 수 없습니다.', 404);
    }

    // Discord 봇 서비스 초기화 및 상태 확인
    const botService = await initializeDiscordBot();
    
    const botStatus = {
      connected: !!team.discord_guild_id && !!team.discord_channel_id,
      bot_ready: botService?.isBotReady() || false,
      webhook_configured: !!team.discord_webhook_url,
      guild_id: team.discord_guild_id,
      channel_id: team.discord_channel_id,
      bot_permissions: team.discord_guild_id ? [
        'Send Messages',
        'Use Slash Commands',
        'Embed Links',
        'Add Reactions',
        'Read Message History',
        'Attach Files'
      ] : [],
      slash_commands_registered: team.discord_guild_id ? [
        '/flowra complete <taskId> - 업무 완료',
        '/flowra extend <taskId> <days> - 업무 연장',
        '/flowra view <taskId> - 업무 상세보기',
        '/flowra reschedule <taskId> <date> - 일정 변경'
      ] : [],
      features: [
        '실시간 슬래시 명령어',
        '인터랙티브 버튼',
        '자동 알림 발송',
        '업무 상태 업데이트'
      ],
      setup_steps: [
        {
          step: 1,
          title: 'Discord Developer Portal에서 봇 생성',
          completed: !!process.env.DISCORD_BOT_TOKEN,
          description: 'Discord Developer Portal에서 Flowra 봇을 생성하고 토큰을 환경 변수에 설정합니다.'
        },
        {
          step: 2,
          title: '봇을 서버에 초대',
          completed: !!team.discord_guild_id,
          description: '생성된 초대 URL로 봇을 Discord 서버에 초대합니다.'
        },
        {
          step: 3,
          title: '채널 설정',
          completed: !!team.discord_channel_id,
          description: '봇이 알림을 보낼 채널을 설정합니다.'
        },
        {
          step: 4,
          title: '봇 온라인 확인',
          completed: botService?.isBotReady() || false,
          description: '봇이 온라인 상태이고 명령어를 사용할 수 있는지 확인합니다.'
        }
      ]
    };

    return createSuccessResponse({
      message: botStatus.connected && botStatus.bot_ready ? 
        'Discord 봇이 연결되어 있고 온라인입니다.' : 
        'Discord 봇 설정이 완료되지 않았습니다.',
      status: botStatus,
    });

  } catch (error) {
    console.error('Discord 봇 상태 확인 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}
