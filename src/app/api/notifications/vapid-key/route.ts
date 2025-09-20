import { NextResponse } from 'next/server';
import { createSuccessResponse } from '@/lib/auth/middleware';

export async function GET() {
  try {
    // VAPID 공개 키 반환
    const publicKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    
    if (!publicKey) {
      return NextResponse.json(
        { error: 'VAPID 키가 설정되지 않았습니다' },
        { status: 500 }
      );
    }

    return createSuccessResponse({ publicKey });
  } catch (error) {
    console.error('VAPID 키 조회 오류:', error);
    return NextResponse.json(
      { error: 'VAPID 키 조회에 실패했습니다' },
      { status: 500 }
    );
  }
}
