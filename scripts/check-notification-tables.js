const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotificationTables() {
  console.log('🔍 알림 관련 테이블 존재 여부 확인 중...\n');

  try {
    // notifications 테이블 확인
    console.log('1. notifications 테이블 확인:');
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (notificationsError) {
      if (notificationsError.code === 'PGRST116') {
        console.log('   ❌ notifications 테이블이 존재하지 않습니다.');
      } else {
        console.log('   ⚠️  notifications 테이블 확인 중 오류:', notificationsError.message);
      }
    } else {
      console.log('   ✅ notifications 테이블이 존재합니다.');
      console.log(`   📊 현재 레코드 수: ${notificationsData?.length || 0}`);
    }

    // notification_preferences 테이블 확인
    console.log('\n2. notification_preferences 테이블 확인:');
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1);

    if (preferencesError) {
      if (preferencesError.code === 'PGRST116') {
        console.log('   ❌ notification_preferences 테이블이 존재하지 않습니다.');
      } else {
        console.log('   ⚠️  notification_preferences 테이블 확인 중 오류:', preferencesError.message);
      }
    } else {
      console.log('   ✅ notification_preferences 테이블이 존재합니다.');
      console.log(`   📊 현재 레코드 수: ${preferencesData?.length || 0}`);
    }

    // 기존 테이블 구조 확인 (존재하는 경우)
    console.log('\n3. 기존 테이블 구조 확인:');
    
    if (!notificationsError) {
      const { data: sampleNotification } = await supabase
        .from('notifications')
        .select('*')
        .limit(1)
        .single();
      
      if (sampleNotification) {
        console.log('   📋 notifications 테이블 컬럼:');
        Object.keys(sampleNotification).forEach(key => {
          console.log(`      - ${key}: ${typeof sampleNotification[key]}`);
        });
      }
    }

    if (!preferencesError) {
      const { data: samplePreference } = await supabase
        .from('notification_preferences')
        .select('*')
        .limit(1)
        .single();
      
      if (samplePreference) {
        console.log('   📋 notification_preferences 테이블 컬럼:');
        Object.keys(samplePreference).forEach(key => {
          console.log(`      - ${key}: ${typeof samplePreference[key]}`);
        });
      }
    }

    // 관련 테이블들도 확인
    console.log('\n4. 관련 테이블 확인:');
    const relatedTables = ['users', 'tasks', 'teams', 'team_members'];
    
    for (const table of relatedTables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`   ❌ ${table} 테이블: 오류 (${error.message})`);
      } else {
        console.log(`   ✅ ${table} 테이블: 존재`);
      }
    }

  } catch (error) {
    console.error('❌ 테이블 확인 중 오류 발생:', error.message);
  }
}

checkNotificationTables();
