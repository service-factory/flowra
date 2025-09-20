const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testNotificationSchema() {
  console.log('🔍 알림 테이블 스키마 테스트...\n');

  try {
    // notifications 테이블 스키마 테스트
    console.log('1. notifications 테이블 스키마 테스트:');
    
    const testNotificationData = {
      user_id: '00000000-0000-0000-0000-000000000000',
      type: 'task_assigned',
      title: '테스트 알림',
      content: '이것은 테스트 알림입니다.',
      data: { task_id: 'test-task-id' },
      is_read: false,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7일 후
    };

    const { data: insertedNotification, error: insertError } = await supabase
      .from('notifications')
      .insert(testNotificationData)
      .select()
      .single();

    if (insertError) {
      console.log('   ❌ notifications 삽입 실패:', insertError.message);
      console.log('   📋 예상 스키마와 다른 부분이 있을 수 있습니다.');
    } else {
      console.log('   ✅ notifications 테이블 스키마 확인됨');
      console.log('   📋 삽입된 데이터 구조:');
      Object.keys(insertedNotification).forEach(key => {
        console.log(`      - ${key}: ${typeof insertedNotification[key]} = ${insertedNotification[key]}`);
      });
      
      // 테스트 데이터 삭제
      await supabase.from('notifications').delete().eq('id', insertedNotification.id);
      console.log('   🗑️  테스트 데이터 삭제됨');
    }

    // notification_preferences 테이블 스키마 테스트
    console.log('\n2. notification_preferences 테이블 스키마 테스트:');
    
    const testPreferenceData = {
      user_id: '00000000-0000-0000-0000-000000000000',
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
      console.log('   📋 예상 스키마와 다른 부분이 있을 수 있습니다.');
    } else {
      console.log('   ✅ notification_preferences 테이블 스키마 확인됨');
      console.log('   📋 삽입된 데이터 구조:');
      Object.keys(insertedPreference).forEach(key => {
        console.log(`      - ${key}: ${typeof insertedPreference[key]} = ${insertedPreference[key]}`);
      });
      
      // 테스트 데이터 삭제
      await supabase.from('notification_preferences').delete().eq('id', insertedPreference.id);
      console.log('   🗑️  테스트 데이터 삭제됨');
    }

    // 실제 사용자 데이터가 있는지 확인
    console.log('\n3. 실제 사용자 데이터 확인:');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(3);

    if (usersError) {
      console.log('   ❌ 사용자 데이터 조회 실패:', usersError.message);
    } else {
      console.log(`   👤 사용자 수: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('   📋 샘플 사용자:');
        users.forEach(user => {
          console.log(`      - ${user.name} (${user.email})`);
        });
      }
    }

  } catch (error) {
    console.error('❌ 스키마 테스트 중 오류 발생:', error.message);
  }
}

testNotificationSchema();
