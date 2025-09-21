import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, authenticateWithTeam } from '@/lib/auth/middleware';
import { createServiceClient } from '@/lib/supabase/server';
import { getDiscordBotService, initializeDiscordBot } from '@/lib/services/discord/discordBotService';
// EmbedBuilder는 동적으로 import
import { z } from 'zod';

const botMessageSchema = z.object({
  team_id: z.string().min(1, '팀 ID가 필요합니다'),
  type: z.enum(['reminder', 'due_date', 'overdue', 'completed']),
  task_id: z.string().optional(),
});

/**
 * POST /api/discord/bot-with-buttons
 * Discord 봇을 통한 실제 버튼이 포함된 알림 발송
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = botMessageSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        `입력 데이터가 유효하지 않습니다: ${validationResult.error.issues.map(e => e.message).join(', ')}`,
        400
      );
    }

    const { team_id, type, task_id } = validationResult.data;

    const authResult = await authenticateWithTeam(request, team_id);
    if (!authResult.success) {
      return authResult.error!;
    }

    // Discord 봇 서비스 초기화
    const botService = await initializeDiscordBot();
    if (!botService || !botService.isBotReady()) {
      return createErrorResponse('Discord 봇이 온라인 상태가 아닙니다. 봇 설정을 확인해주세요.', 503);
    }

    // Supabase 클라이언트 생성
    const supabase = createServiceClient();

    // 팀 정보 조회
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, discord_guild_id, discord_channel_id')
      .eq('id', team_id)
      .single();

    if (teamError || !team) {
      return createErrorResponse('팀 정보를 가져올 수 없습니다.', 404);
    }

    if (!team.discord_guild_id || !team.discord_channel_id) {
      return createErrorResponse('Discord 봇이 설정되지 않았습니다. Discord 봇을 먼저 연결해주세요.', 400);
    }

    // Discord Embed 생성
    const embed = await createEmbedForType(type, team.name, task_id || 'test-task-123');

    // Discord 봇을 통해 메시지 발송 (실제 버튼 포함)
    await botService.sendNotificationWithButtons(team.discord_channel_id, embed, task_id || 'test-task-123', type);
    
    return createSuccessResponse({
      message: 'Discord 봇을 통한 알림이 성공적으로 발송되었습니다!',
      type,
      task_id: task_id || null,
      channel_id: team.discord_channel_id,
      guild_id: team.discord_guild_id,
      has_buttons: true,
      bot_ready: botService.isBotReady(),
    });

  } catch (error) {
    console.error('Discord 봇 알림 발송 오류:', error);
    
    // 에러 타입별 맞춤형 메시지
    let errorMessage = '서버 오류가 발생했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('Discord.js가 초기화되지 않았습니다')) {
        errorMessage = 'Discord 봇이 아직 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.';
        statusCode = 503;
      } else if (error.message.includes('Discord 봇이 설정되지 않았습니다')) {
        errorMessage = 'Discord 봇이 설정되지 않았습니다. 봇 연결을 먼저 확인해주세요.';
        statusCode = 400;
      } else if (error.message.includes('권한')) {
        errorMessage = 'Discord 봇 권한이 부족합니다. 서버 관리자에게 문의하세요.';
        statusCode = 403;
      } else if (error.message.includes('채널')) {
        errorMessage = 'Discord 채널에 접근할 수 없습니다. 채널 설정을 확인해주세요.';
        statusCode = 404;
      }
    }
    
    return createErrorResponse(errorMessage, statusCode);
  }
}

/**
 * 알림 타입에 따른 Embed 생성
 */
async function createEmbedForType(type: string, teamName: string, taskId?: string) {
  // Discord.js 동적 import (eval 사용으로 빌드 시점 import 방지)
  const discordJS = await eval('import("discord.js")');
  
  // UI/UX 개선을 위한 공통 설정
  const baseConfig = {
    footer: {
      text: `Flowra • ${teamName}`,
      iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png'
    },
    timestamp: new Date(),
    // Flowra 브랜드 색상 팔레트
    colors: {
      primary: 0x6366f1,    // 인디고 (Flowra 메인)
      success: 0x10b981,    // 에메랄드
      warning: 0xf59e0b,    // 앰버
      danger: 0xef4444,     // 레드
      info: 0x3b82f6,       // 블루
      neutral: 0x6b7280     // 그레이
    }
  };

  switch (type) {
    case 'reminder':
      return new discordJS.EmbedBuilder()
        .setTitle('🌅 아침 업무 리마인드')
        .setDescription('**좋은 아침입니다!** 내일 마감 예정인 업무를 확인해보세요.')
        .setColor(baseConfig.colors.info)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456789.png') // 일출 이모지
        .addFields([
          {
            name: '📋 내일 마감 업무',
            value: taskId ? 
              `**🎯 테스트 업무**\n` +
              `📅 **마감일:** 2024-12-21 (내일)\n` +
              `📝 **설명:** 개발 환경 테스트용 업무\n` +
              `⏰ **남은 시간:** 약 24시간\n` +
              `👤 **담당자:** 테스트 사용자` :
              `**🎯 테스트 업무 1**\n` +
              `📅 **마감일:** 2024-12-21 (내일)\n` +
              `📝 **설명:** 개발 환경 테스트용 업무\n` +
              `⏰ **남은 시간:** 약 24시간\n` +
              `👤 **담당자:** 테스트 사용자`,
            inline: false
          },
          {
            name: '💡 팁',
            value: '버튼을 클릭하여 업무를 바로 관리하거나 `/flowra view` 명령어를 사용해보세요!',
            inline: false
          }
        ])
        .setFooter(baseConfig.footer)
        .setTimestamp(baseConfig.timestamp);
    
    case 'due_date':
      const currentTime = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const hoursLeft = Math.ceil((endOfDay.getTime() - currentTime.getTime()) / (1000 * 60 * 60));
      
      return new discordJS.EmbedBuilder()
        .setTitle('🚨 긴급! 마감일 알림')
        .setDescription(`**${hoursLeft}시간 남았습니다!** 지금 바로 작업을 시작하세요.`)
        .setColor(baseConfig.colors.warning)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456790.png') // 경고 이모지
        .addFields([
          {
            name: '🎯 업무 정보',
            value: `**제목:** 테스트 업무\n**마감일:** ${new Date().toLocaleDateString('ko-KR')} (오늘)\n**담당자:** 테스트 사용자`,
            inline: true
          },
          {
            name: '⏰ 남은 시간',
            value: `${hoursLeft}시간 ${Math.ceil((endOfDay.getTime() - currentTime.getTime()) / (1000 * 60)) % 60}분`,
            inline: true
          },
          {
            name: '🚀 빠른 액션',
            value: '아래 버튼을 클릭하여 업무를 완료하거나 연장하세요!',
            inline: false
          }
        ])
        .setFooter(baseConfig.footer)
        .setTimestamp(baseConfig.timestamp);
    
    case 'overdue':
      const overdueDate = new Date('2024-12-19');
      const today = new Date();
      const daysOverdue = Math.ceil((today.getTime() - overdueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return new discordJS.EmbedBuilder()
        .setTitle('🚨 연체 업무 알림')
        .setDescription(`**${daysOverdue}일 연체되었습니다!** 즉시 조치가 필요합니다.`)
        .setColor(baseConfig.colors.danger)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456791.png') // 경고 이모지
        .addFields([
          {
            name: '📋 연체 업무',
            value: `**제목:** 테스트 업무\n**원래 마감일:** 2024-12-19\n**담당자:** 테스트 사용자`,
            inline: true
          },
          {
            name: '⏰ 연체 정보',
            value: `**연체 기간:** ${daysOverdue}일\n**우선순위:** 높음\n**상태:** 긴급`,
            inline: true
          },
          {
            name: '🆘 즉시 조치 필요',
            value: '업무를 완료하거나 일정을 조정해주세요. 팀원들에게 상황을 공유하는 것도 고려해보세요.',
            inline: false
          }
        ])
        .setFooter(baseConfig.footer)
        .setTimestamp(baseConfig.timestamp);
    
    case 'completed':
      const completionTime = new Date();
      const completionMessages = [
        '🎉 훌륭합니다! 업무를 성공적으로 완료하셨네요!',
        '🌟 멋진 작업이었습니다! 다음 업무도 화이팅!',
        '✨ 완벽한 완료입니다! 팀에 큰 기여를 하셨어요!',
        '🚀 대단합니다! 목표를 달성하셨네요!',
        '💪 훌륭한 성과입니다! 계속 이런 모습 유지하세요!'
      ];
      const randomMessage = completionMessages[Math.floor(Math.random() * completionMessages.length)];
      
      return new discordJS.EmbedBuilder()
        .setTitle('🎉 업무 완료!')
        .setDescription(randomMessage)
        .setColor(baseConfig.colors.success)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456792.png') // 축하 이모지
        .addFields([
          {
            name: '✅ 완료된 업무',
            value: `**제목:** 테스트 업무\n**완료자:** 테스트 사용자\n**완료 시간:** ${completionTime.toLocaleString('ko-KR')}`,
            inline: true
          },
          {
            name: '📊 성과 요약',
            value: `**상태:** 완료 ✅\n**품질:** 우수\n**기여도:** 높음`,
            inline: true
          },
          {
            name: '🎯 다음 단계',
            value: '다른 업무를 확인하거나 팀원들과 완료를 공유해보세요!',
            inline: false
          }
        ])
        .setFooter(baseConfig.footer)
        .setTimestamp(baseConfig.timestamp);
    
    default:
      return new discordJS.EmbedBuilder()
        .setTitle('📢 Flowra 알림')
        .setDescription('새로운 알림이 도착했습니다.')
        .setColor(baseConfig.colors.primary)
        .setThumbnail('https://cdn.discordapp.com/emojis/1234567890123456793.png') // 일반 알림 이모지
        .addFields([
          {
            name: 'ℹ️ 알림 정보',
            value: '알림이 성공적으로 발송되었습니다.\n자세한 내용은 Flowra 앱에서 확인해보세요.',
            inline: false
          }
        ])
        .setFooter(baseConfig.footer)
        .setTimestamp(baseConfig.timestamp);
  }
}

/**
 * Discord 버튼 컴포넌트 생성 (UI/UX 개선)
 */
function createActionButtons(taskId: string, notificationType: string = 'general') {
  // 알림 타입별 맞춤형 버튼 구성
  const buttonConfigs = {
    reminder: {
      primary: {
        type: 2,
        style: 3, // Success (초록색)
        label: '지금 시작',
        custom_id: `start_${taskId}`,
        emoji: { name: '🚀' }
      },
      secondary: [
        {
          type: 2,
          style: 1, // Primary (파란색)
          label: '일정 조정',
          custom_id: `reschedule_${taskId}`,
          emoji: { name: '📅' }
        },
        {
          type: 2,
          style: 2, // Secondary (회색)
          label: '상세보기',
          custom_id: `view_${taskId}`,
          emoji: { name: '👁️' }
        }
      ]
    },
    due_date: {
      primary: {
        type: 2,
        style: 3, // Success (초록색)
        label: '완료 처리',
        custom_id: `complete_${taskId}`,
        emoji: { name: '✅' }
      },
      secondary: [
        {
          type: 2,
          style: 4, // Danger (빨간색)
          label: '긴급 연장',
          custom_id: `urgent_extend_${taskId}`,
          emoji: { name: '🚨' }
        },
        {
          type: 2,
          style: 2, // Secondary (회색)
          label: '상세보기',
          custom_id: `view_${taskId}`,
          emoji: { name: '📋' }
        }
      ]
    },
    overdue: {
      primary: {
        type: 2,
        style: 4, // Danger (빨간색)
        label: '즉시 완료',
        custom_id: `complete_${taskId}`,
        emoji: { name: '🔥' }
      },
      secondary: [
        {
          type: 2,
          style: 4, // Danger (빨간색)
          label: '긴급 연장',
          custom_id: `urgent_extend_${taskId}`,
          emoji: { name: '⚡' }
        },
        {
          type: 2,
          style: 2, // Secondary (회색)
          label: '상황 공유',
          custom_id: `share_${taskId}`,
          emoji: { name: '📢' }
        }
      ]
    },
    completed: {
      primary: {
        type: 2,
        style: 3, // Success (초록색)
        label: '완료 확인',
        custom_id: `confirm_${taskId}`,
        emoji: { name: '🎉' }
      },
      secondary: [
        {
          type: 2,
          style: 1, // Primary (파란색)
          label: '다음 업무',
          custom_id: `next_task_${taskId}`,
          emoji: { name: '➡️' }
        },
        {
          type: 2,
          style: 2, // Secondary (회색)
          label: '성과 공유',
          custom_id: `share_${taskId}`,
          emoji: { name: '📊' }
        }
      ]
    },
    general: {
      primary: {
        type: 2,
        style: 3, // Success (초록색)
        label: '완료',
        custom_id: `complete_${taskId}`,
        emoji: { name: '✅' }
      },
      secondary: [
        {
          type: 2,
          style: 1, // Primary (파란색)
          label: '연장',
          custom_id: `extend_${taskId}`,
          emoji: { name: '⏰' }
        },
        {
          type: 2,
          style: 2, // Secondary (회색)
          label: '상세보기',
          custom_id: `view_${taskId}`,
          emoji: { name: '📋' }
        }
      ]
    }
  };

  const config = buttonConfigs[notificationType] || buttonConfigs.general;
  
  // 첫 번째 행: 주요 액션 버튼
  const primaryRow = {
    type: 1, // ActionRow
    components: [config.primary]
  };

  // 두 번째 행: 보조 액션 버튼들
  const secondaryRow = {
    type: 1, // ActionRow
    components: config.secondary
  };

  return [primaryRow, secondaryRow];
}
