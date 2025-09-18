import { NextRequest } from 'next/server';
import { authenticateWithTeam, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';

// 초대 재전송 (현재 team_invitations 테이블이 없으므로 임시 비활성화)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string; invitationId: string }> }
) {
  try {
    console.log('🔍 초대 재전송 API 호출 (임시 비활성화):', { url: request.url, method: request.method });
    
    return createErrorResponse('초대 재전송 기능은 현재 개발 중입니다', 501);

  } catch (error) {
    console.error('초대 재전송 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
