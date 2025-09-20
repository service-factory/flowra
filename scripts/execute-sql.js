const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeSQL() {
  console.log('🔍 알림 테이블 스키마 확인...\n');

  try {
    // notifications 테이블 구조 확인
    console.log('1. notifications 테이블 구조:');
    const { data: notificationsSchema, error: notificationsError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'notifications' 
          ORDER BY ordinal_position;
        `
      });

    if (notificationsError) {
      console.log('   ❌ notifications 스키마 조회 실패:', notificationsError.message);
    } else {
      console.log('   📋 notifications 테이블 컬럼:');
      notificationsSchema?.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    // notification_preferences 테이블 구조 확인
    console.log('\n2. notification_preferences 테이블 구조:');
    const { data: preferencesSchema, error: preferencesError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = 'notification_preferences' 
          ORDER BY ordinal_position;
        `
      });

    if (preferencesError) {
      console.log('   ❌ notification_preferences 스키마 조회 실패:', preferencesError.message);
    } else {
      console.log('   📋 notification_preferences 테이블 컬럼:');
      preferencesSchema?.forEach(col => {
        console.log(`      - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
    }

    // 인덱스 정보 확인
    console.log('\n3. 인덱스 정보:');
    const { data: indexInfo, error: indexError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            indexname,
            indexdef
          FROM pg_indexes 
          WHERE tablename IN ('notifications', 'notification_preferences');
        `
      });

    if (indexError) {
      console.log('   ❌ 인덱스 정보 조회 실패:', indexError.message);
    } else {
      console.log('   📊 인덱스 정보:');
      indexInfo?.forEach(idx => {
        console.log(`      - ${idx.indexname}`);
      });
    }

  } catch (error) {
    console.error('❌ SQL 실행 중 오류 발생:', error.message);
    
    // 대안: 직접 테이블에 데이터를 삽입해서 스키마 확인
    console.log('\n🔄 대안 방법으로 스키마 확인 중...');
    
    try {
      // notifications 테이블에 테스트 데이터 삽입
      const { data: testNotification, error: insertError } = await supabase
        .from('notifications')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          type: 'test',
          title: 'Test',
          content: 'Test notification',
          data: {},
          is_read: false
        })
        .select()
        .single();

      if (insertError) {
        console.log('   ❌ notifications 테스트 삽입 실패:', insertError.message);
      } else {
        console.log('   ✅ notifications 테이블 스키마 확인됨');
        // 테스트 데이터 삭제
        await supabase.from('notifications').delete().eq('id', testNotification.id);
      }

      // notification_preferences 테이블에 테스트 데이터 삽입
      const { data: testPreference, error: prefInsertError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000',
          type: 'test',
          email_enabled: true,
          push_enabled: true,
          discord_enabled: true
        })
        .select()
        .single();

      if (prefInsertError) {
        console.log('   ❌ notification_preferences 테스트 삽입 실패:', prefInsertError.message);
      } else {
        console.log('   ✅ notification_preferences 테이블 스키마 확인됨');
        // 테스트 데이터 삭제
        await supabase.from('notification_preferences').delete().eq('id', testPreference.id);
      }

    } catch (testError) {
      console.error('   ❌ 테스트 삽입 중 오류:', testError.message);
    }
  }
}

executeSQL();
