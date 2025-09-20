import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticate } from '@/lib/auth/middleware';
import { z } from 'zod';

// 알림 업데이트 스키마
const updateNotificationSchema = z.object({
  is_read: z.boolean().optional(),
  read_at: z.string().datetime().optional(),
});

/**
 * GET /api/notifications/[id]
 * 특정 알림 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const notificationId = resolvedParams.id;

    if (!notificationId) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = authResult.user!.id;

    // 알림 조회 (본인 알림만)
    const { data: notification, error: notificationError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', userId)
      .single();

    if (notificationError || !notification) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 만료된 알림인지 확인
    if (notification.expires_at && new Date(notification.expires_at) < new Date()) {
      return NextResponse.json(
        { error: '만료된 알림입니다.' },
        { status: 410 }
      );
    }

    return NextResponse.json(notification);

  } catch (error) {
    console.error('알림 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/[id]
 * 알림 업데이트 (읽음 처리 등)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const notificationId = resolvedParams.id;
    const body = await request.json();

    if (!notificationId) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 요청 데이터 검증
    const validationResult = updateNotificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = authResult.user!.id;

    // 알림 존재 확인 (본인 알림만)
    const { data: existingNotification, error: checkError } = await supabase
      .from('notifications')
      .select('id, user_id, is_read')
      .eq('id', notificationId)
      .eq('user_id', userId)
      .single();

    if (checkError || !existingNotification) {
      return NextResponse.json(
        { error: '알림을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 읽음 처리 시 read_at 자동 설정
    const finalUpdateData = { ...updateData };
    if (updateData.is_read === true && !updateData.read_at) {
      finalUpdateData.read_at = new Date().toISOString();
    } else if (updateData.is_read === false) {
      finalUpdateData.read_at = undefined;
    }

    // 알림 업데이트
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update(finalUpdateData)
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('알림 업데이트 오류:', updateError);
      return NextResponse.json(
        { error: '알림을 업데이트할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '알림이 성공적으로 업데이트되었습니다.',
      notification: updatedNotification,
    });

  } catch (error) {
    console.error('알림 업데이트 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * 알림 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const notificationId = resolvedParams.id;

    if (!notificationId) {
      return NextResponse.json(
        { error: '알림 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = authResult.user!.id;

    // 알림 삭제 (본인 알림만)
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('알림 삭제 오류:', deleteError);
      return NextResponse.json(
        { error: '알림을 삭제할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '알림이 성공적으로 삭제되었습니다.',
    });

  } catch (error) {
    console.error('알림 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
