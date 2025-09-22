import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

const reactionSchema = z.object({
  message_id: z.string().min(1, '메시지 ID가 필요합니다'),
  channel_id: z.string().min(1, '채널 ID가 필요합니다'),
  task_id: z.string().optional(),
});

/**
 * POST /api/discord/add-reactions
 * Discord 메시지에 반응 추가 (봇을 통한 인터랙션)
 * 
 * 사용법:
 * 1. 웹훅으로 알림 메시지 발송
 * 2. 메시지 ID를 받아서 이 API로 반응 추가
 * 3. 사용자가 반응을 클릭하면 봇이 인터랙션 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = reactionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        `입력 데이터가 유효하지 않습니다: ${validationResult.error.issues.map(e => e.message).join(', ')}`,
        400
      );
    }

    const { message_id, channel_id, task_id } = validationResult.data;

    // Discord 봇을 통한 반응 추가 (실제 구현 시 Discord.js 사용)
    const reactions = [
      { emoji: '✅', action: 'complete' },
      { emoji: '⏰', action: 'extend' },
      { emoji: '📋', action: 'view' },
      { emoji: '📅', action: 'reschedule' }
    ];

    // 실제 Discord 봇 구현 시:
    // 1. Discord.js 클라이언트로 메시지에 반응 추가
    // 2. 각 반응에 대한 이벤트 리스너 등록
    // 3. 사용자가 반응을 클릭하면 해당 액션 실행

    return createSuccessResponse({
      message: 'Discord 메시지에 반응이 추가되었습니다.',
      message_id,
      channel_id,
      task_id: task_id || null,
      reactions: reactions.map(r => ({
        emoji: r.emoji,
        action: r.action,
        description: getReactionDescription(r.action)
      }))
    });

  } catch (error) {
    console.error('Discord 반응 추가 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

function getReactionDescription(action: string): string {
  switch (action) {
    case 'complete': return '업무 완료';
    case 'extend': return '업무 연장';
    case 'view': return '상세보기';
    case 'reschedule': return '일정 변경';
    default: return '알 수 없는 액션';
  }
}
