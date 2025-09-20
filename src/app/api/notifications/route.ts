import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticate } from '@/lib/auth/middleware';
import { z } from 'zod';
import type { 
  NotificationListResponse
} from '@/types/notifications';

// 알림 생성 스키마
const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  type: z.enum([
    'task_assigned', 'task_due', 'task_overdue', 'task_completed', 
    'task_updated', 'task_comment', 'team_invitation', 'team_member_joined',
    'team_member_left', 'project_created', 'project_updated', 'system', 'mention'
  ]),
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  expires_at: z.string().datetime().optional(),
});

// 알림 목록 조회 스키마
const getNotificationsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum([
    'task_assigned', 'task_due', 'task_overdue', 'task_completed', 
    'task_updated', 'task_comment', 'team_invitation', 'team_member_joined',
    'team_member_left', 'project_created', 'project_updated', 'system', 'mention'
  ]).optional(),
  is_read: z.coerce.boolean().optional(),
});

/**
 * GET /api/notifications
 * 알림 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // 파라미터 검증
    const validationResult = getNotificationsSchema.safeParse(params);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 파라미터입니다.', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { page, limit, type, is_read } = validationResult.data;
    const offset = (page - 1) * limit;

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = authResult.user!.id;

    // 알림 목록 조회 쿼리 빌드
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 필터 적용
    if (type) {
      query = query.eq('type', type);
    }
    
    if (is_read !== undefined) {
      query = query.eq('is_read', is_read);
    }

    // 만료되지 않은 알림만 조회
    query = query.or('expires_at.is.null,expires_at.gt.now()');

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1);

    const { data: notifications, error: notificationsError } = await query;

    if (notificationsError) {
      console.error('알림 목록 조회 오류:', notificationsError);
      return NextResponse.json(
        { error: '알림 목록을 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 전체 개수 조회
    let countQuery = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (type) {
      countQuery = countQuery.eq('type', type);
    }
    
    if (is_read !== undefined) {
      countQuery = countQuery.eq('is_read', is_read);
    }

    const { count: totalCount, error: countError } = await countQuery;

    if (countError) {
      console.error('알림 개수 조회 오류:', countError);
      return NextResponse.json(
        { error: '알림 개수를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 읽지 않은 알림 개수 조회
    const { count: unreadCount, error: unreadError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .or('expires_at.is.null,expires_at.gt.now()');

    if (unreadError) {
      console.error('읽지 않은 알림 개수 조회 오류:', unreadError);
      return NextResponse.json(
        { error: '읽지 않은 알림 개수를 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    const response: NotificationListResponse = {
      notifications: notifications || [],
      total_count: totalCount || 0,
      unread_count: unreadCount || 0,
      has_more: (offset + limit) < (totalCount || 0),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('알림 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * 알림 생성
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = createNotificationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const notificationData = validationResult.data;

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();

    // 사용자 존재 확인
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', notificationData.user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 알림 생성
    const { data: notification, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: notificationData.user_id,
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content || null,
        data: notificationData.data as any || {},
        expires_at: notificationData.expires_at || null,
        is_read: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error('알림 생성 오류:', insertError);
      return NextResponse.json(
        { error: '알림을 생성할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '알림이 성공적으로 생성되었습니다.',
      notification,
    }, { status: 201 });

  } catch (error) {
    console.error('알림 생성 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
