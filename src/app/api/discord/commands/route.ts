import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

const commandSchema = z.object({
  command: z.string(),
  args: z.array(z.string()).optional(),
  userId: z.string().uuid('올바른 사용자 ID가 아닙니다'),
  teamId: z.string().uuid('올바른 팀 ID가 아닙니다'),
  channelId: z.string().optional(),
});

/**
 * POST /api/discord/commands
 * Discord 명령어 처리
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = commandSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse(
        '잘못된 명령어 형식입니다.',
        400
      );
    }

    const { command, userId, teamId } = validationResult.data;

    // 명령어 파싱
    const [action, ...commandArgs] = command.split(' ');

    switch (action) {
      case '/flowra':
        return await handleFlowraCommand(commandArgs, userId, teamId);
      case 'help':
        return await handleHelpCommand();
      default:
        return createErrorResponse(`알 수 없는 명령어입니다: ${action}`, 400);
    }

  } catch (error) {
    console.error('Discord 명령어 처리 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다.', 500);
  }
}

/**
 * /flowra 명령어 처리
 */
async function handleFlowraCommand(args: string[], userId: string, teamId: string) {
  if (args.length === 0) {
    return createErrorResponse('사용법: /flowra <action> [args...]', 400);
  }

  const [action, ...actionArgs] = args;

  switch (action) {
    case 'complete':
      return await handleCompleteCommand(actionArgs, userId, teamId);
    case 'extend':
      return await handleExtendCommand(actionArgs, userId, teamId);
    case 'reschedule':
      return await handleRescheduleCommand(actionArgs, userId, teamId);
    case 'view':
      return await handleViewCommand(actionArgs, userId, teamId);
    case 'help':
      return await handleFlowraHelp();
    default:
      return createErrorResponse(`알 수 없는 액션입니다: ${action}`, 400);
  }
}

/**
 * 완료 명령어 처리
 */
async function handleCompleteCommand(args: string[], userId: string, teamId: string) {
  if (args.length === 0) {
    return createErrorResponse('사용법: /flowra complete <taskId>', 400);
  }

  const taskId = args[0];

  // 인터랙션 API 호출
  const interactionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      action: 'complete',
      userId,
      teamId,
    }),
  });

  const result = await interactionResponse.json();

  if (!interactionResponse.ok) {
    return createErrorResponse(result.message || '업무 완료 처리에 실패했습니다.', interactionResponse.status);
  }

  return createSuccessResponse({
    message: '✅ 업무가 완료되었습니다!',
    data: result.data,
  });
}

/**
 * 연장 명령어 처리
 */
async function handleExtendCommand(args: string[], userId: string, teamId: string) {
  if (args.length < 2) {
    return createErrorResponse('사용법: /flowra extend <taskId> <days>', 400);
  }

  const taskId = args[0];
  const days = parseInt(args[1]);

  if (isNaN(days) || days < 1) {
    return createErrorResponse('연장 일수는 1 이상의 숫자여야 합니다.', 400);
  }

  // 인터랙션 API 호출
  const interactionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      action: 'extend',
      userId,
      teamId,
      data: { days },
    }),
  });

  const result = await interactionResponse.json();

  if (!interactionResponse.ok) {
    return createErrorResponse(result.message || '업무 연장 처리에 실패했습니다.', interactionResponse.status);
  }

  return createSuccessResponse({
    message: `⏰ 업무가 ${days}일 연장되었습니다!`,
    data: result.data,
  });
}

/**
 * 일정 변경 명령어 처리
 */
async function handleRescheduleCommand(args: string[], userId: string, teamId: string) {
  if (args.length < 2) {
    return createErrorResponse('사용법: /flowra reschedule <taskId> <newDate>', 400);
  }

  const taskId = args[0];
  const newDate = args[1];

  // 날짜 형식 검증
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(newDate)) {
    return createErrorResponse('날짜 형식은 YYYY-MM-DD여야 합니다. 예: 2024-12-25', 400);
  }

  // 인터랙션 API 호출
  const interactionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      action: 'reschedule',
      userId,
      teamId,
      data: { new_due_date: newDate },
    }),
  });

  const result = await interactionResponse.json();

  if (!interactionResponse.ok) {
    return createErrorResponse(result.message || '업무 일정 변경 처리에 실패했습니다.', interactionResponse.status);
  }

  return createSuccessResponse({
    message: '📅 업무 일정이 변경되었습니다!',
    data: result.data,
  });
}

/**
 * 상세보기 명령어 처리
 */
async function handleViewCommand(args: string[], userId: string, teamId: string) {
  if (args.length === 0) {
    return createErrorResponse('사용법: /flowra view <taskId>', 400);
  }

  const taskId = args[0];

  // 인터랙션 API 호출
  const interactionResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/interactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      taskId,
      action: 'view',
      userId,
      teamId,
    }),
  });

  const result = await interactionResponse.json();

  if (!interactionResponse.ok) {
    return createErrorResponse(result.message || '업무 상세 조회에 실패했습니다.', interactionResponse.status);
  }

  return createSuccessResponse({
    message: '📋 업무 상세 정보',
    data: result.data,
  });
}

/**
 * 도움말 명령어 처리
 */
async function handleFlowraHelp() {
  return createSuccessResponse({
    message: '**📋 Flowra Discord 명령어 도움말**\n\n' +
      '**업무 관리:**\n' +
      '`/flowra complete <taskId>` - 업무 완료\n' +
      '`/flowra extend <taskId> <days>` - 업무 연장 (일수)\n' +
      '`/flowra reschedule <taskId> <YYYY-MM-DD>` - 일정 변경\n' +
      '`/flowra view <taskId>` - 업무 상세보기\n\n' +
      '**예시:**\n' +
      '`/flowra complete abc123-def456`\n' +
      '`/flowra extend abc123-def456 3`\n' +
      '`/flowra reschedule abc123-def456 2024-12-25`\n\n' +
      '**도움말:**\n' +
      '`/flowra help` - 이 도움말 보기',
  });
}

/**
 * 일반 도움말 명령어 처리
 */
async function handleHelpCommand() {
  return createSuccessResponse({
    message: '**🤖 Flowra Discord 봇 명령어**\n\n' +
      '**Flowra 명령어:**\n' +
      '`/flowra help` - Flowra 명령어 도움말\n\n' +
      '**기타:**\n' +
      '`help` - 이 도움말 보기\n\n' +
      '더 자세한 정보는 `/flowra help`를 사용하세요!',
  });
}
