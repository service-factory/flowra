import { NextRequest } from 'next/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * POST /api/discord/admin/set-reminder
 * Body: { user_id: string, reminder_time: 'HH:MM', timezone: string, enabled?: boolean }
 * Header: X-Admin-Token: <process.env.ADMIN_API_TOKEN>
 */
export async function POST(request: NextRequest) {
  try {
    const adminToken = request.headers.get('x-admin-token') || request.headers.get('X-Admin-Token');
    if (!process.env.ADMIN_API_TOKEN || adminToken !== process.env.ADMIN_API_TOKEN) {
      return createErrorResponse('Unauthorized', 401);
    }

    const body = await request.json();
    const { user_id, reminder_time, timezone, enabled } = body || {};

    if (!user_id || !reminder_time || !timezone) {
      return createErrorResponse('user_id, reminder_time, timezone가 필요합니다.', 400);
    }

    // 간단 검증
    if (!/^([0-1]?\d|2[0-3]):[0-5]\d$/.test(reminder_time)) {
      return createErrorResponse('reminder_time은 HH:MM 형식이어야 합니다.', 400);
    }

    const supabase = createServiceClient() as any; // widen types for non-generated table

    // upsert
    const now = new Date().toISOString();
    const { data: existing } = await supabase
      .from('discord_user_settings')
      .select('user_id')
      .eq('user_id', user_id)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('discord_user_settings')
        .update({
          reminder_time,
          timezone,
          reminder_enabled: enabled ?? true,
          updated_at: now,
        })
        .eq('user_id', user_id);
      if (error) {
        console.error('update error:', error);
        return createErrorResponse('설정 업데이트 실패', 500);
      }
    } else {
      const { error } = await supabase
        .from('discord_user_settings')
        .insert({
          user_id,
          reminder_time,
          timezone,
          reminder_enabled: enabled ?? true,
          created_at: now,
          updated_at: now,
        });
      if (error) {
        console.error('insert error:', error);
        return createErrorResponse('설정 생성 실패', 500);
      }
    }

    return createSuccessResponse({ ok: true });
  } catch (error) {
    console.error('admin set-reminder error:', error);
    return createErrorResponse('서버 오류', 500);
  }
}


