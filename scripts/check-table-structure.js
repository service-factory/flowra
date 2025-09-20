const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  console.log('🔍 테이블 구조 상세 확인...\n');

  try {
    // notifications 테이블 구조 확인
    console.log('1. notifications 테이블 구조:');
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);

    if (!notificationsError && notificationsData) {
      // 빈 테이블이므로 직접 스키마 정보를 가져와야 함
      console.log('   📋 notifications 테이블이 비어있습니다. 예상 스키마를 확인해보겠습니다.');
      
      // 테이블 정보를 가져오기 위해 다른 방법 시도
      const { data: schemaInfo } = await supabase.rpc('get_table_info', { table_name: 'notifications' });
      if (schemaInfo) {
        console.log('   📊 스키마 정보:', schemaInfo);
      }
    }

    // notification_preferences 테이블 구조 확인
    console.log('\n2. notification_preferences 테이블 구조:');
    const { data: preferencesData, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('*')
      .limit(1);

    if (!preferencesError && preferencesData) {
      console.log('   📋 notification_preferences 테이블이 비어있습니다.');
    }

    // 관련 테이블들의 샘플 데이터로 구조 파악
    console.log('\n3. 관련 테이블 구조 확인:');
    
    // users 테이블
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .limit(1)
      .single();
    
    if (usersData) {
      console.log('   👤 users 테이블 컬럼:');
      Object.keys(usersData).forEach(key => {
        console.log(`      - ${key}: ${typeof usersData[key]}`);
      });
    }

    // tasks 테이블
    const { data: tasksData } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
      .single();
    
    if (tasksData) {
      console.log('   📝 tasks 테이블 컬럼:');
      Object.keys(tasksData).forEach(key => {
        console.log(`      - ${key}: ${typeof tasksData[key]}`);
      });
    }

    // teams 테이블
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .limit(1)
      .single();
    
    if (teamsData) {
      console.log('   👥 teams 테이블 컬럼:');
      Object.keys(teamsData).forEach(key => {
        console.log(`      - ${key}: ${typeof teamsData[key]}`);
      });
    }

    // team_members 테이블
    const { data: teamMembersData } = await supabase
      .from('team_members')
      .select('*')
      .limit(1)
      .single();
    
    if (teamMembersData) {
      console.log('   🤝 team_members 테이블 컬럼:');
      Object.keys(teamMembersData).forEach(key => {
        console.log(`      - ${key}: ${typeof teamMembersData[key]}`);
      });
    }

  } catch (error) {
    console.error('❌ 테이블 구조 확인 중 오류 발생:', error.message);
  }
}

checkTableStructure();
