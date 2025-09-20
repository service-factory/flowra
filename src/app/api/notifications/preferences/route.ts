import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { authenticate } from '@/lib/auth/middleware';
import { z } from 'zod';
import type { 
  NotificationPreference, 
  NotificationPreferencesResponse,
  NotificationType 
} from '@/types/notifications';

// 알림 설정 업데이트 스키마
const updatePreferenceSchema = z.object({
  type: z.enum([
    'task_assigned', 'task_due', 'task_overdue', 'task_completed', 
    'task_updated', 'task_comment', 'team_invitation', 'team_member_joined',
    'team_member_left', 'project_created', 'project_updated', 'system', 'mention'
  ]),
  email_enabled: z.boolean(),
  push_enabled: z.boolean(),
  discord_enabled: z.boolean(),
  in_app_enabled: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  quiet_hours_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
});

// 기본 알림 설정
const DEFAULT_PREFERENCES: Record<NotificationType, {
  email_enabled: boolean;
  push_enabled: boolean;
  discord_enabled: boolean;
  in_app_enabled: boolean;
}> = {
  task_assigned: { email_enabled: true, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  task_due: { email_enabled: true, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  task_overdue: { email_enabled: true, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  task_completed: { email_enabled: false, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  task_updated: { email_enabled: false, push_enabled: false, discord_enabled: false, in_app_enabled: true },
  task_comment: { email_enabled: false, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  team_invitation: { email_enabled: true, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  team_member_joined: { email_enabled: false, push_enabled: false, discord_enabled: false, in_app_enabled: true },
  team_member_left: { email_enabled: false, push_enabled: false, discord_enabled: false, in_app_enabled: true },
  project_created: { email_enabled: false, push_enabled: false, discord_enabled: false, in_app_enabled: true },
  project_updated: { email_enabled: false, push_enabled: false, discord_enabled: false, in_app_enabled: true },
  system: { email_enabled: true, push_enabled: true, discord_enabled: false, in_app_enabled: true },
  mention: { email_enabled: true, push_enabled: true, discord_enabled: true, in_app_enabled: true },
};

/**
 * GET /api/notifications/preferences
 * 알림 설정 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = authResult.user!.id;

    // 사용자의 알림 설정 조회
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('type');

    if (preferencesError) {
      console.error('알림 설정 조회 오류:', preferencesError);
      return NextResponse.json(
        { error: '알림 설정을 조회할 수 없습니다.' },
        { status: 500 }
      );
    }

    const response: NotificationPreferencesResponse = {
      preferences: preferences || [],
      default_preferences: DEFAULT_PREFERENCES,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('알림 설정 조회 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications/preferences
 * 알림 설정 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    const validationResult = updatePreferenceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const preferenceData = validationResult.data;

    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    const supabase = await createClient();
    const userId = authResult.user!.id;

    // 기존 설정 확인
    const { data: existingPreference, error: checkError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('type', preferenceData.type)
      .single();

    let updatedPreference: NotificationPreference;

    if (checkError && checkError.code === 'PGRST116') {
      // 새로운 설정 생성
      const { data: newPreference, error: insertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: userId,
          type: preferenceData.type,
          email_enabled: preferenceData.email_enabled,
          push_enabled: preferenceData.push_enabled,
          discord_enabled: preferenceData.discord_enabled,
          in_app_enabled: preferenceData.in_app_enabled ?? true,
          quiet_hours_start: preferenceData.quiet_hours_start || null,
          quiet_hours_end: preferenceData.quiet_hours_end || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error('알림 설정 생성 오류:', insertError);
        return NextResponse.json(
          { error: '알림 설정을 생성할 수 없습니다.' },
          { status: 500 }
        );
      }

      updatedPreference = newPreference;
    } else if (checkError) {
      console.error('알림 설정 확인 오류:', checkError);
      return NextResponse.json(
        { error: '알림 설정을 확인할 수 없습니다.' },
        { status: 500 }
      );
    } else {
      // 기존 설정 업데이트
      const { data: updatedPreferenceData, error: updateError } = await supabase
        .from('notification_preferences')
        .update({
          email_enabled: preferenceData.email_enabled,
          push_enabled: preferenceData.push_enabled,
          discord_enabled: preferenceData.discord_enabled,
          in_app_enabled: preferenceData.in_app_enabled ?? true,
          quiet_hours_start: preferenceData.quiet_hours_start || null,
          quiet_hours_end: preferenceData.quiet_hours_end || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingPreference.id)
        .select()
        .single();

      if (updateError) {
        console.error('알림 설정 업데이트 오류:', updateError);
        return NextResponse.json(
          { error: '알림 설정을 업데이트할 수 없습니다.' },
          { status: 500 }
        );
      }

      updatedPreference = updatedPreferenceData;
    }

    return NextResponse.json({
      message: '알림 설정이 성공적으로 저장되었습니다.',
      preference: updatedPreference,
    });

  } catch (error) {
    console.error('알림 설정 업데이트 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/preferences
 * 알림 설정 삭제 (기본값으로 재설정)
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (!type) {
      return NextResponse.json(
        { error: '알림 타입이 필요합니다.' },
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

    // 사용자의 해당 타입 알림 설정 삭제
    const { error: deleteError } = await supabase
      .from('notification_preferences')
      .delete()
      .eq('user_id', userId)
      .eq('type', type);

    if (deleteError) {
      console.error('알림 설정 삭제 오류:', deleteError);
      return NextResponse.json(
        { error: '알림 설정을 삭제할 수 없습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '알림 설정이 기본값으로 재설정되었습니다.',
    });

  } catch (error) {
    console.error('알림 설정 삭제 중 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
