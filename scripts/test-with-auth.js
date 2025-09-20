const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 실제 사용자로 인증된 클라이언트 생성
const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithAuth() {
  console.log('🔍 인증된 사용자로 알림 테이블 테스트...\n');

  try {
    // 실제 사용자 정보 가져오기
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('   ❌ 인증된 사용자가 없습니다. 수동으로 세션을 설정해야 합니다.');
      console.log('   💡 브라우저에서 로그인 후 개발자 도구에서 세션 토큰을 복사해주세요.');
      return;
    }

    console.log(`   👤 인증된 사용자: ${user.email}`);
    console.log(`   🆔 사용자 ID: ${user.id}`);

    // notifications 테이블 테스트
    console.log('\n1. notifications 테이블 테스트:');
    
    const testNotificationData = {
      user_id: user.id,
      type: 'task_assigned',
      title: '테스트 알림',
      content: '이것은 테스트 알림입니다.',
      data: { task_id: 'test-task-id' },
      is_read: false
    };

    const { data: insertedNotification, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotificationData)
      .select()
      .single();

    if (insertError) {
      console.log('   ❌ notifications 삽입 실패:', insertError.message);
    } else {
      console.log('   ✅ notifications 테이블 스키마 확인됨');
      console.log('   📋 삽입된 데이터 구조:');
      Object.keys(insertedNotification).forEach(key => {
        const value = insertedNotification[key];
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        console.log(`      - ${key}: ${typeof value} = ${displayValue}`);
      });
      
      // 테스트 데이터 삭제
      await supabase.from('notifications').delete().eq('id', insertedNotification.id);
      console.log('   🗑️  테스트 데이터 삭제됨');
    }

    // notification_preferences 테이블 테스트
    console.log('\n2. notification_preferences 테이블 테스트:');
    
    const testPreferenceData = {
      user_id: user.id,
      type: 'task_assigned',
      email_enabled: true,
      push_enabled: true,
      discord_enabled: true
    };

    const { data: insertedPreference, error: prefInsertError } = await supabase
      .from('notification_preferences')
      .insert(testPreferenceData)
      .select()
      .single();

    if (prefInsertError) {
      console.log('   ❌ notification_preferences 삽입 실패:', prefInsertError.message);
    } else {
      console.log('   ✅ notification_preferences 테이블 스키마 확인됨');
      console.log('   📋 삽입된 데이터 구조:');
      Object.keys(insertedPreference).forEach(key => {
        const value = insertedPreference[key];
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        console.log(`      - ${key}: ${typeof value} = ${displayValue}`);
      });
      
      // 테스트 데이터 삭제
      await supabase.from('notification_preferences').delete().eq('id', insertedPreference.id);
      console.log('   🗑️  테스트 데이터 삭제됨');
    }

    // 기존 알림 데이터 확인
    console.log('\n3. 기존 알림 데이터 확인:');
    const { data: existingNotifications, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id);

    if (notificationsError) {
      console.log('   ❌ 알림 데이터 조회 실패:', notificationsError.message);
    } else {
      console.log(`   📊 기존 알림 수: ${existingNotifications?.length || 0}`);
    }

    // 기존 알림 설정 확인
    console.log('\n4. 기존 알림 설정 확인:');
    const { data: existingPreferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id);

    if (preferencesError) {
      console.log('   ❌ 알림 설정 조회 실패:', preferencesError.message);
    } else {
      console.log(`   ⚙️  기존 알림 설정 수: ${existingPreferences?.length || 0}`);
      if (existingPreferences && existingPreferences.length > 0) {
        existingPreferences.forEach(pref => {
          console.log(`      - ${pref.type}: email=${pref.email_enabled}, push=${pref.push_enabled}, discord=${pref.discord_enabled}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 인증 테스트 중 오류 발생:', error.message);
  }
}

testWithAuth();
