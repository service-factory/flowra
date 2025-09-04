# Flowra 데이터베이스 설계 명세서

## 1. 데이터베이스 개요

### 1.1 데이터베이스 정보
- **데이터베이스**: Supabase (PostgreSQL 15)
- **목적**: Flowra 업무 관리 시스템의 데이터 저장 및 관리
- **호스팅**: Supabase Cloud
- **백업**: 자동 일일 백업

### 1.2 핵심 엔티티
- 사용자 (Users)
- 팀 (Teams)
- 프로젝트 (Projects)
- 업무 (Tasks)
- 알림 (Notifications)
- 파일 (Files)

## 2. 데이터베이스 스키마

### 2.1 사용자 및 인증 관련 테이블

#### 2.1.1 users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  provider VARCHAR(50) NOT NULL, -- 'kakao' or 'google'
  provider_id VARCHAR(255) NOT NULL, -- OAuth provider의 사용자 ID
  discord_id VARCHAR(255) UNIQUE,
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
  email_verified BOOLEAN DEFAULT true, -- OAuth로 로그인하면 이메일이 검증됨
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id) -- 같은 provider에서 중복 방지
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_users_provider_id ON users(provider_id);
CREATE INDEX idx_users_discord_id ON users(discord_id);
CREATE INDEX idx_users_is_active ON users(is_active);
```

#### 2.1.2 oauth_accounts 테이블 (Supabase Auth와 연동)
```sql
-- Supabase Auth의 auth.users와 연동되는 테이블
-- 실제 세션 관리는 Supabase Auth에서 처리
CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'kakao' or 'google'
  provider_id VARCHAR(255) NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- 인덱스
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);
CREATE INDEX idx_oauth_accounts_provider ON oauth_accounts(provider);
CREATE INDEX idx_oauth_accounts_provider_id ON oauth_accounts(provider_id);
```

### 2.2 팀 및 조직 관련 테이블

#### 2.2.1 teams 테이블
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  discord_guild_id VARCHAR(255) UNIQUE,
  discord_channel_id VARCHAR(255),
  discord_bot_token_encrypted TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_slug ON teams(slug);
CREATE INDEX idx_teams_discord_guild_id ON teams(discord_guild_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);
```

#### 2.2.2 team_members 테이블
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- admin, member, viewer
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- 인덱스
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_is_active ON team_members(is_active);
```

#### 2.2.3 team_invitations 테이블
```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- 인덱스
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_expires_at ON team_invitations(expires_at);
```

### 2.3 프로젝트 관련 테이블

#### 2.3.1 projects 테이블
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- hex color
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_is_active ON projects(is_active);
CREATE INDEX idx_projects_created_by ON projects(created_by);
```

### 2.4 업무 관련 테이블

#### 2.4.1 tasks 테이블
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled, on_hold
  priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  position INTEGER DEFAULT 0, -- 정렬 순서
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_creator_id ON tasks(creator_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_team_status ON tasks(team_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);
CREATE INDEX idx_tasks_due_date_status ON tasks(due_date, status) WHERE due_date IS NOT NULL;
```

#### 2.4.2 task_tags 테이블
```sql
CREATE TABLE task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, tag)
);

-- 인덱스
CREATE INDEX idx_task_tags_task_id ON task_tags(task_id);
CREATE INDEX idx_task_tags_tag ON task_tags(tag);
```

#### 2.4.3 task_comments 테이블
```sql
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- 내부 메모 여부
  parent_id UUID REFERENCES task_comments(id) ON DELETE CASCADE, -- 대댓글
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX idx_task_comments_parent_id ON task_comments(parent_id);
CREATE INDEX idx_task_comments_created_at ON task_comments(created_at);
```

#### 2.4.4 task_history 테이블
```sql
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- created, updated, status_changed, assigned, etc.
  field_name VARCHAR(100), -- 변경된 필드명
  old_value JSONB,
  new_value JSONB,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_task_history_task_id ON task_history(task_id);
CREATE INDEX idx_task_history_user_id ON task_history(user_id);
CREATE INDEX idx_task_history_action ON task_history(action);
CREATE INDEX idx_task_history_created_at ON task_history(created_at);
```

#### 2.4.5 task_dependencies 테이블
```sql
CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type VARCHAR(50) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, depends_on_task_id),
  CHECK (task_id != depends_on_task_id)
);

-- 인덱스
CREATE INDEX idx_task_dependencies_task_id ON task_dependencies(task_id);
CREATE INDEX idx_task_dependencies_depends_on ON task_dependencies(depends_on_task_id);
```

### 2.5 알림 관련 테이블

#### 2.5.1 notifications 테이블
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- task_assigned, task_due, task_completed, team_invitation, etc.
  title VARCHAR(255) NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}', -- 추가 데이터
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = false;
```

#### 2.5.2 notification_preferences 테이블
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  discord_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- 인덱스
CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_type ON notification_preferences(type);
```

### 2.6 파일 관련 테이블

#### 2.6.1 files 테이블
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_files_task_id ON files(task_id);
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_mime_type ON files(mime_type);
CREATE INDEX idx_files_created_at ON files(created_at);
```

### 2.7 시스템 관련 테이블

#### 2.7.1 audit_logs 테이블
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_team_id ON audit_logs(team_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### 2.7.2 system_settings 테이블
```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_is_public ON system_settings(is_public);
```

## 3. Row Level Security (RLS) 정책

### 3.1 사용자 테이블 RLS
```sql
-- users 테이블 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- OAuth 계정 정보는 본인만 조회 가능
ALTER TABLE oauth_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own oauth accounts" ON oauth_accounts
  FOR SELECT USING (auth.uid() = user_id);
```

### 3.2 팀 관련 테이블 RLS
```sql
-- teams 테이블 RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 팀 멤버만 팀 정보 조회 가능
CREATE POLICY "Team members can view team" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

-- 팀 소유자만 팀 정보 수정 가능
CREATE POLICY "Team owners can update team" ON teams
  FOR UPDATE USING (owner_id = auth.uid());

-- team_members 테이블 RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 팀 멤버만 팀원 목록 조회 가능
CREATE POLICY "Team members can view members" ON team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );
```

### 3.3 업무 관련 테이블 RLS
```sql
-- tasks 테이블 RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 팀 멤버만 업무 조회 가능
CREATE POLICY "Team members can view tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = tasks.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

-- 팀 멤버만 업무 생성 가능
CREATE POLICY "Team members can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = tasks.team_id
      AND tm.user_id = auth.uid()
      AND tm.is_active = true
    )
  );

-- 담당자 또는 팀 관리자만 업무 수정 가능
CREATE POLICY "Assignees and admins can update tasks" ON tasks
  FOR UPDATE USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM team_members tm
      WHERE tm.team_id = tasks.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'admin'
      AND tm.is_active = true
    )
  );
```

## 4. 데이터베이스 함수 및 트리거

### 4.1 자동 업데이트 트리거
```sql
-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4.2 업무 히스토리 자동 생성
```sql
-- 업무 변경 히스토리 생성 함수
CREATE OR REPLACE FUNCTION create_task_history()
RETURNS TRIGGER AS $$
BEGIN
  -- 상태 변경 시 히스토리 생성
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO task_history (task_id, user_id, action, field_name, old_value, new_value)
    VALUES (
      NEW.id,
      COALESCE(NEW.assignee_id, NEW.creator_id),
      'status_changed',
      'status',
      to_jsonb(OLD.status),
      to_jsonb(NEW.status)
    );
  END IF;

  -- 완료 시 completed_at 설정
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  ELSIF NEW.status != 'completed' THEN
    NEW.completed_at = NULL;
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- tasks 테이블에 트리거 적용
CREATE TRIGGER task_history_trigger
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_history();
```

### 4.3 알림 자동 생성
```sql
-- 업무 할당 시 알림 생성 함수
CREATE OR REPLACE FUNCTION create_task_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- 담당자가 변경된 경우 알림 생성
  IF OLD.assignee_id IS DISTINCT FROM NEW.assignee_id AND NEW.assignee_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, content, data)
    VALUES (
      NEW.assignee_id,
      'task_assigned',
      '새로운 업무가 할당되었습니다',
      '업무: ' || NEW.title,
      jsonb_build_object(
        'task_id', NEW.id,
        'task_title', NEW.title,
        'due_date', NEW.due_date,
        'priority', NEW.priority
      )
    );
  END IF;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- tasks 테이블에 트리거 적용
CREATE TRIGGER task_assignment_notification_trigger
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION create_task_assignment_notification();
```

## 5. 데이터베이스 뷰

### 5.1 업무 통계 뷰
```sql
CREATE VIEW task_statistics AS
SELECT 
  t.team_id,
  t.assignee_id,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE t.status = 'pending') as pending_tasks,
  COUNT(*) FILTER (WHERE t.status = 'in_progress') as in_progress_tasks,
  COUNT(*) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(*) FILTER (WHERE t.due_date < NOW() AND t.status NOT IN ('completed', 'cancelled')) as overdue_tasks,
  AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as avg_completion_hours
FROM tasks t
WHERE t.created_at >= NOW() - INTERVAL '30 days'
GROUP BY t.team_id, t.assignee_id;
```

### 5.2 팀 활동 뷰
```sql
CREATE VIEW team_activity AS
SELECT 
  tm.team_id,
  tm.user_id,
  u.name as user_name,
  u.email as user_email,
  COUNT(t.id) as total_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_tasks,
  COUNT(t.id) FILTER (WHERE t.due_date < NOW() AND t.status NOT IN ('completed', 'cancelled')) as overdue_tasks,
  MAX(t.updated_at) as last_activity
FROM team_members tm
LEFT JOIN users u ON tm.user_id = u.id
LEFT JOIN tasks t ON tm.team_id = t.team_id AND t.assignee_id = tm.user_id
WHERE tm.is_active = true
GROUP BY tm.team_id, tm.user_id, u.name, u.email;
```

## 6. 데이터베이스 마이그레이션

### 6.1 초기 마이그레이션
```sql
-- 001_initial_schema.sql
-- 사용자 및 팀 관련 테이블 생성
-- (위의 CREATE TABLE 문들 포함)

-- 002_add_indexes.sql
-- 성능 최적화를 위한 인덱스 생성
-- (위의 CREATE INDEX 문들 포함)

-- 003_add_rls_policies.sql
-- 보안을 위한 RLS 정책 적용
-- (위의 RLS 정책들 포함)

-- 004_add_functions_triggers.sql
-- 비즈니스 로직을 위한 함수 및 트리거 생성
-- (위의 함수 및 트리거들 포함)
```

### 6.2 데이터 시딩
```sql
-- 초기 시스템 설정 데이터
INSERT INTO system_settings (key, value, description, is_public) VALUES
('app_name', '"Flowra"', '애플리케이션 이름', true),
('max_file_size', '10485760', '최대 파일 크기 (바이트)', true),
('default_task_priority', '"medium"', '기본 업무 우선순위', true),
('notification_retention_days', '30', '알림 보관 기간 (일)', false),
('supported_oauth_providers', '["kakao", "google"]', '지원하는 OAuth 제공자', true),
('oauth_redirect_urls', '{"kakao": "https://yourdomain.com/api/auth/callback/kakao", "google": "https://yourdomain.com/api/auth/callback/google"}', 'OAuth 리다이렉트 URL', false);

-- 기본 알림 타입 설정 (사용자 생성 시 자동으로 생성되도록 트리거 사용)
-- 실제로는 사용자가 가입할 때마다 자동으로 생성됨
```

## 7. 성능 최적화

### 7.1 쿼리 최적화
```sql
-- 자주 사용되는 쿼리 최적화
-- 팀별 업무 목록 조회 (인덱스 활용)
EXPLAIN (ANALYZE, BUFFERS) 
SELECT t.*, u.name as assignee_name, p.name as project_name
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
LEFT JOIN projects p ON t.project_id = p.id
WHERE t.team_id = $1
ORDER BY t.created_at DESC
LIMIT 20;

-- 마감일 임박 업무 조회
CREATE INDEX idx_tasks_due_soon ON tasks(team_id, due_date) 
WHERE due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days' 
AND status NOT IN ('completed', 'cancelled');
```

### 7.2 파티셔닝 전략
```sql
-- 대용량 데이터 처리를 위한 파티셔닝
-- audit_logs 테이블 월별 파티셔닝
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_y2024m02 PARTITION OF audit_logs
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

## 8. 백업 및 복구

### 8.1 백업 전략
```sql
-- 자동 백업 설정 (Supabase에서 제공)
-- 1. 일일 전체 백업
-- 2. 실시간 WAL 백업
-- 3. Point-in-time 복구 지원

-- 중요한 데이터 수동 백업
CREATE TABLE backup_tasks AS 
SELECT * FROM tasks WHERE created_at >= NOW() - INTERVAL '7 days';
```

### 8.2 데이터 복구 절차
```sql
-- 특정 시점으로 복구
-- 1. Supabase 대시보드에서 Point-in-time 복구 실행
-- 2. 또는 백업 파일에서 복구

-- 특정 테이블 복구
TRUNCATE TABLE tasks;
INSERT INTO tasks SELECT * FROM backup_tasks;
```

## 9. 모니터링 및 유지보수

### 9.1 성능 모니터링
```sql
-- 느린 쿼리 모니터링
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 테이블 크기 모니터링
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 9.2 정기 유지보수
```sql
-- 주간 정리 작업
-- 1. 만료된 세션 정리
DELETE FROM user_sessions WHERE expires_at < NOW();

-- 2. 만료된 초대 정리
DELETE FROM team_invitations WHERE expires_at < NOW() AND accepted_at IS NULL;

-- 3. 오래된 알림 정리
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days' AND is_read = true;

-- 4. 통계 업데이트
ANALYZE;
```

## 10. 개발 체크리스트

### 10.1 데이터베이스 설계
- [ ] ERD 설계 및 검토
- [ ] OAuth 기반 사용자 테이블 구조 설계
- [ ] 관계 설정 및 외래키 정의
- [ ] 인덱스 설계
- [ ] 제약조건 정의

### 10.2 스키마 구현
- [ ] OAuth 기반 사용자 테이블 생성
- [ ] 인덱스 생성 스크립트 작성
- [ ] RLS 정책 구현
- [ ] 함수 및 트리거 구현
- [ ] 뷰 생성

### 10.3 마이그레이션
- [ ] 마이그레이션 스크립트 작성
- [ ] 롤백 스크립트 작성
- [ ] 데이터 시딩 스크립트 작성
- [ ] 마이그레이션 테스트
- [ ] 프로덕션 배포

### 10.4 성능 최적화
- [ ] 쿼리 성능 분석
- [ ] 인덱스 최적화
- [ ] 파티셔닝 적용
- [ ] 캐싱 전략 구현
- [ ] 모니터링 설정

### 10.5 보안
- [ ] RLS 정책 검토
- [ ] 데이터 암호화 설정
- [ ] 접근 권한 검토
- [ ] 감사 로그 설정
- [ ] 백업 암호화

### 10.6 테스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 성능 테스트 실행
- [ ] 보안 테스트 실행
- [ ] 데이터 무결성 테스트

### 10.7 문서화
- [ ] 스키마 문서 작성
- [ ] API 문서 작성
- [ ] 운영 가이드 작성
- [ ] 백업/복구 가이드 작성
- [ ] 트러블슈팅 가이드 작성

## 11. 개발 일정 (예상)

### Phase 1: 설계 및 기본 스키마 (3일)
- ERD 설계
- 기본 테이블 생성
- 관계 설정

### Phase 2: 고급 기능 (2일)
- RLS 정책 구현
- 함수 및 트리거 구현
- 뷰 생성

### Phase 3: 최적화 및 테스트 (2일)
- 인덱스 최적화
- 성능 테스트
- 보안 검토

### Phase 4: 배포 및 모니터링 (1일)
- 프로덕션 배포
- 모니터링 설정
- 문서화

## 12. 위험 요소 및 대응 방안

### 12.1 데이터 손실 위험
- **위험**: 실수로 인한 데이터 삭제
- **대응**: 자동 백업 및 Point-in-time 복구 설정

### 12.2 성능 저하 위험
- **위험**: 대용량 데이터로 인한 성능 저하
- **대응**: 인덱스 최적화 및 파티셔닝 적용

### 12.3 보안 위험
- **위험**: 무단 데이터 접근
- **대응**: RLS 정책 및 감사 로그 구현

## 13. 참고 자료

### 13.1 PostgreSQL 문서
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Supabase 문서](https://supabase.com/docs)
- [Row Level Security 가이드](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

### 13.2 성능 최적화
- [PostgreSQL 성능 튜닝](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [인덱스 최적화 가이드](https://use-the-index-luke.com/)

---

**문서 버전**: 1.0  
**작성일**: 2024년 12월  
**최종 수정일**: 2024년 12월  
**작성자**: 개발팀
