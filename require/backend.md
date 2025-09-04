# Flowra 백엔드 개발 명세서

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
- **프로젝트명**: Flowra Backend
- **목적**: 사이드 프로젝트 팀의 업무 관리 및 디스코드 연동을 위한 API 서버
- **기술 스택**: Next.js 14 API Routes (Serverless), Supabase
- **배포**: Vercel + Supabase

### 1.2 핵심 기능
- 소셜 로그인 (카카오, 구글) 인증 및 권한 관리
- 업무 CRUD 및 상태 관리
- 팀 관리 및 멤버 관리
- 디스코드 봇 연동
- 실시간 알림 시스템
- 파일 업로드 및 관리

## 2. 기술 스택 및 아키텍처

### 2.1 백엔드 기술 스택
```
- Framework: Next.js 14 API Routes
- Language: TypeScript
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth + OAuth (카카오, 구글)
- File Storage: Supabase Storage
- Real-time: Supabase Realtime
- Discord Integration: Discord.js
- Validation: Zod
- HTTP Client: Axios
- Environment: Vercel Serverless
```

### 2.2 API 아키텍처
```
src/
├── app/
│   └── api/                    # Next.js API Routes
│       ├── auth/              # 인증 관련 API
│       │   ├── callback/      # OAuth 콜백 처리
│       │   │   ├── kakao/     # GET /api/auth/callback/kakao
│       │   │   └── google/    # GET /api/auth/callback/google
│       │   ├── logout/        # POST /api/auth/logout
│       │   └── me/            # GET /api/auth/me
│       ├── tasks/             # 업무 관리 API
│       │   ├── route.ts       # GET, POST /api/tasks
│       │   └── [id]/          # GET, PUT, DELETE /api/tasks/[id]
│       ├── team/              # 팀 관리 API
│       │   ├── members/       # 팀원 관리
│       │   └── projects/      # 프로젝트 관리
│       ├── notifications/     # 알림 API
│       ├── discord/           # 디스코드 연동 API
│       └── upload/            # 파일 업로드 API
├── lib/                       # 공통 라이브러리
│   ├── supabase/             # Supabase 클라이언트
│   ├── discord/              # 디스코드 봇
│   ├── auth/                 # 인증 유틸리티
│   ├── validation/           # 데이터 검증
│   └── utils/                # 공통 유틸리티
├── types/                    # TypeScript 타입 정의
└── middleware/               # 미들웨어
```

## 3. API 엔드포인트 설계

### 3.1 인증 API
```typescript
// GET /api/auth/callback/kakao
interface KakaoCallbackRequest {
  code: string;
  state?: string;
}

// GET /api/auth/callback/google
interface GoogleCallbackRequest {
  code: string;
  state?: string;
}

interface OAuthCallbackResponse {
  user: User;
  session: Session;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

// POST /api/auth/logout
interface LogoutResponse {
  success: boolean;
  message: string;
}

// GET /api/auth/me
interface MeResponse {
  user: User;
  team: Team;
  permissions: Permission[];
  provider: 'kakao' | 'google';
}
```

### 3.2 업무 관리 API
```typescript
// GET /api/tasks
interface GetTasksRequest {
  page?: number;
  limit?: number;
  status?: TaskStatus[];
  assigneeId?: string;
  priority?: Priority[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

interface GetTasksResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// POST /api/tasks
interface CreateTaskRequest {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  priority: Priority;
  tags: string[];
  projectId?: string;
}

// PUT /api/tasks/[id]
interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: Priority;
  status?: TaskStatus;
  tags?: string[];
}

// PATCH /api/tasks/[id]/status
interface UpdateTaskStatusRequest {
  status: TaskStatus;
  comment?: string;
}
```

### 3.3 팀 관리 API
```typescript
// GET /api/team/members
interface GetTeamMembersResponse {
  members: TeamMember[];
  total: number;
}

// POST /api/team/members
interface InviteMemberRequest {
  email: string;
  role: TeamRole;
}

// PUT /api/team/members/[id]
interface UpdateMemberRequest {
  role?: TeamRole;
  isActive?: boolean;
}
```

### 3.4 알림 API
```typescript
// GET /api/notifications
interface GetNotificationsRequest {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

// POST /api/notifications/mark-read
interface MarkReadRequest {
  notificationIds: string[];
}
```

### 3.5 디스코드 연동 API
```typescript
// POST /api/discord/connect
interface ConnectDiscordRequest {
  code: string;
  guildId: string;
}

// GET /api/discord/status
interface DiscordStatusResponse {
  isConnected: boolean;
  guildName?: string;
  channelId?: string;
  botPermissions: string[];
}
```

## 4. 데이터베이스 스키마

### 4.1 사용자 및 팀 관련 테이블
```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀 테이블
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  discord_guild_id VARCHAR(255),
  discord_channel_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀 멤버 테이블
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- admin, member
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
```

### 4.2 업무 관련 테이블
```sql
-- 프로젝트 테이블
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- hex color
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업무 테이블
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  priority VARCHAR(50) NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업무 태그 테이블
CREATE TABLE task_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_id, tag)
);

-- 업무 댓글 테이블
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업무 히스토리 테이블
CREATE TABLE task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL, -- created, updated, status_changed, assigned, etc.
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 알림 및 파일 관련 테이블
```sql
-- 알림 테이블
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- task_assigned, task_due, task_completed, etc.
  title VARCHAR(255) NOT NULL,
  content TEXT,
  data JSONB, -- 추가 데이터
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 파일 테이블
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size BIGINT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. 인증 및 권한 관리

### 5.1 인증 전략
```typescript
// Supabase JWT 토큰 기반 인증
interface SupabaseJWTPayload {
  sub: string; // user id
  email: string;
  aud: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  provider: 'kakao' | 'google';
}

// OAuth 콜백 처리
export async function handleOAuthCallback(
  provider: 'kakao' | 'google',
  code: string,
  state?: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // OAuth 토큰 교환
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    throw new Error(`OAuth error: ${error.message}`);
  }

  // 사용자 정보 가져오기
  const user = data.user;
  const session = data.session;

  // 새 사용자인지 확인
  const isNewUser = !user.user_metadata?.full_name;

  return {
    user,
    session,
    isNewUser,
    provider
  };
}

// 미들웨어를 통한 인증 검증
export async function withAuth(
  req: NextRequest,
  handler: (req: NextRequest, user: User) => Promise<Response>
) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    return handler(req, user);
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
  }
}
```

### 5.2 권한 관리
```typescript
enum Permission {
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TEAM_MANAGE = 'team:manage',
  MEMBER_INVITE = 'member:invite',
  MEMBER_REMOVE = 'member:remove',
  DISCORD_CONNECT = 'discord:connect',
}

interface RolePermissions {
  [TeamRole.ADMIN]: Permission[];
  [TeamRole.MEMBER]: Permission[];
}

const ROLE_PERMISSIONS: RolePermissions = {
  [TeamRole.ADMIN]: Object.values(Permission),
  [TeamRole.MEMBER]: [
    Permission.TASK_CREATE,
    Permission.TASK_READ,
    Permission.TASK_UPDATE,
  ],
};
```

## 6. 디스코드 봇 연동

### 6.1 디스코드 봇 설정
```typescript
// Discord Bot 클라이언트
import { Client, GatewayIntentBits, Events } from 'discord.js';

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// 봇 이벤트 핸들러
discordClient.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  
  // /create-task 명령어 처리
  if (message.content.startsWith('/create-task')) {
    await handleCreateTaskCommand(message);
  }
  
  // 일정 조정 메시지 처리
  if (message.content.includes('일정 조정')) {
    await handleScheduleAdjustment(message);
  }
});
```

### 6.2 디스코드 명령어
```typescript
// 업무 생성 명령어
interface CreateTaskCommand {
  command: '/create-task';
  title: string;
  description?: string;
  assignee?: string; // 멘션 또는 사용자명
  dueDate?: string; // YYYY-MM-DD 형식
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// 일정 조정 메시지 처리
async function handleScheduleAdjustment(message: Message) {
  const taskId = extractTaskId(message.content);
  const newDueDate = extractNewDueDate(message.content);
  const reason = extractReason(message.content);
  
  if (taskId && newDueDate) {
    await updateTaskDueDate(taskId, newDueDate, reason);
    await message.reply('✅ 일정이 조정되었습니다.');
  }
}
```

### 6.3 알림 시스템
```typescript
// 알림 발송 함수
async function sendDiscordNotification(
  channelId: string,
  notification: NotificationData
) {
  const channel = await discordClient.channels.fetch(channelId);
  
  if (channel?.isTextBased()) {
    const embed = createNotificationEmbed(notification);
    await channel.send({ embeds: [embed] });
  }
}

// 마감일 알림
async function sendDueDateReminder(task: Task) {
  const assignee = await getUserById(task.assigneeId);
  const notification = {
    title: '업무 마감일 알림',
    description: `"${task.title}" 업무의 마감일이 ${formatDate(task.dueDate)}입니다.`,
    color: 0xff6b6b,
    fields: [
      { name: '담당자', value: `<@${assignee.discordId}>`, inline: true },
      { name: '우선순위', value: task.priority, inline: true },
    ],
  };
  
  await sendDiscordNotification(task.team.discordChannelId, notification);
}
```

## 7. 실시간 기능

### 7.1 Supabase Realtime 설정
```typescript
// 실시간 구독 설정
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 업무 상태 변경 실시간 알림
export async function subscribeToTaskUpdates(teamId: string) {
  const channel = supabase
    .channel(`tasks:${teamId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `team_id=eq.${teamId}`,
      },
      (payload) => {
        // 클라이언트에 실시간 업데이트 전송
        broadcastTaskUpdate(payload);
      }
    )
    .subscribe();
    
  return channel;
}
```

### 7.2 WebSocket 연결 관리
```typescript
// WebSocket 서버 (Vercel에서는 Server-Sent Events 사용)
export async function GET(request: NextRequest) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // 클라이언트 연결 등록
      const clientId = generateClientId();
      connectedClients.set(clientId, controller);
      
      // 연결 유지 메시지
      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode('data: {"type":"ping"}\n\n'));
      }, 30000);
      
      // 연결 해제 시 정리
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive);
        connectedClients.delete(clientId);
      });
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

## 8. 파일 업로드 및 관리

### 8.1 파일 업로드 API
```typescript
// POST /api/upload
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const taskId = formData.get('taskId') as string;
  
  if (!file || !taskId) {
    return NextResponse.json({ error: 'Missing file or taskId' }, { status: 400 });
  }
  
  // 파일 검증
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }
  
  // Supabase Storage에 업로드
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('task-files')
    .upload(fileName, file);
    
  if (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
  
  // 데이터베이스에 파일 정보 저장
  const fileRecord = await createFileRecord({
    taskId,
    filename: data.path,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url: data.publicUrl,
  });
  
  return NextResponse.json({ file: fileRecord });
}
```

### 8.2 파일 다운로드 및 삭제
```typescript
// GET /api/files/[id]/download
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const file = await getFileById(params.id);
  
  if (!file) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
  
  // Supabase Storage에서 파일 다운로드
  const { data, error } = await supabase.storage
    .from('task-files')
    .download(file.filename);
    
  if (error) {
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
  
  return new Response(data, {
    headers: {
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    },
  });
}
```

## 9. 에러 처리 및 로깅

### 9.1 에러 처리 미들웨어
```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): Response {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  // 예상치 못한 에러 로깅
  console.error('Unexpected error:', error);
  
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### 9.2 로깅 시스템
```typescript
// 구조화된 로깅
interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  userId?: string;
  teamId?: string;
  metadata?: Record<string, any>;
}

export function log(entry: LogEntry) {
  const logMessage = {
    ...entry,
    timestamp: new Date().toISOString(),
    service: 'flowra-backend',
  };
  
  console.log(JSON.stringify(logMessage));
  
  // 프로덕션에서는 외부 로깅 서비스로 전송
  if (process.env.NODE_ENV === 'production') {
    // Sentry, LogRocket 등으로 전송
  }
}
```

## 10. 성능 최적화

### 10.1 데이터베이스 최적화
```sql
-- 인덱스 생성
CREATE INDEX idx_tasks_team_id ON tasks(team_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- 복합 인덱스
CREATE INDEX idx_tasks_team_status ON tasks(team_id, status);
CREATE INDEX idx_tasks_assignee_status ON tasks(assignee_id, status);
```

### 10.2 캐싱 전략
```typescript
// Redis 캐싱 (Vercel KV 사용)
import { kv } from '@vercel/kv';

export async function getCachedTasks(teamId: string) {
  const cacheKey = `tasks:${teamId}`;
  const cached = await kv.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const tasks = await getTasksFromDB(teamId);
  await kv.setex(cacheKey, 300, tasks); // 5분 캐시
  
  return tasks;
}

export async function invalidateTasksCache(teamId: string) {
  const cacheKey = `tasks:${teamId}`;
  await kv.del(cacheKey);
}
```

## 11. 보안

### 11.1 입력 검증
```typescript
import { z } from 'zod';

// 업무 생성 검증 스키마
const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().uuid(),
  dueDate: z.string().datetime(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  tags: z.array(z.string().max(50)).max(10),
});

export function validateCreateTask(data: unknown) {
  return createTaskSchema.parse(data);
}
```

### 11.2 Rate Limiting
```typescript
// API 요청 제한
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15분
) {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= limit) {
    return false;
  }
  
  record.count++;
  return true;
}
```

## 12. 개발 체크리스트

### 12.1 프로젝트 초기 설정
- [ ] Next.js 14 프로젝트 생성
- [ ] TypeScript 설정
- [ ] ESLint + Prettier 설정
- [ ] Supabase 프로젝트 생성 및 설정
- [ ] 환경 변수 설정
- [ ] Git 저장소 초기화

### 12.2 데이터베이스 설정
- [ ] Supabase 데이터베이스 스키마 생성
- [ ] 테이블 생성 및 관계 설정
- [ ] 인덱스 생성
- [ ] RLS (Row Level Security) 정책 설정
- [ ] 데이터베이스 함수 및 트리거 생성
- [ ] 초기 데이터 시딩

### 12.3 인증 시스템
- [ ] Supabase Auth 설정
- [ ] 카카오 OAuth 설정 및 콜백 API 구현
- [ ] 구글 OAuth 설정 및 콜백 API 구현
- [ ] JWT 토큰 처리 미들웨어 구현
- [ ] 로그아웃 API 구현
- [ ] 권한 검증 미들웨어 구현

### 12.4 업무 관리 API
- [ ] 업무 목록 조회 API 구현
- [ ] 업무 생성 API 구현
- [ ] 업무 상세 조회 API 구현
- [ ] 업무 수정 API 구현
- [ ] 업무 삭제 API 구현
- [ ] 업무 상태 변경 API 구현
- [ ] 업무 검색 및 필터링 API 구현

### 12.5 팀 관리 API
- [ ] 팀 생성 API 구현
- [ ] 팀원 초대 API 구현
- [ ] 팀원 목록 조회 API 구현
- [ ] 팀원 권한 변경 API 구현
- [ ] 팀원 제거 API 구현
- [ ] 팀 설정 변경 API 구현

### 12.6 디스코드 봇 연동
- [ ] Discord.js 클라이언트 설정
- [ ] 봇 명령어 처리 구현
- [ ] 업무 생성 명령어 구현
- [ ] 일정 조정 메시지 처리 구현
- [ ] 알림 발송 기능 구현
- [ ] 봇 권한 관리 구현

### 12.7 알림 시스템
- [ ] 알림 생성 API 구현
- [ ] 알림 목록 조회 API 구현
- [ ] 알림 읽음 처리 API 구현
- [ ] 디스코드 알림 발송 구현
- [ ] 이메일 알림 발송 구현
- [ ] 실시간 알림 구현

### 12.8 파일 관리
- [ ] 파일 업로드 API 구현
- [ ] 파일 다운로드 API 구현
- [ ] 파일 삭제 API 구현
- [ ] 파일 목록 조회 API 구현
- [ ] 파일 크기 제한 구현
- [ ] 파일 타입 검증 구현

### 12.9 실시간 기능
- [ ] Supabase Realtime 설정
- [ ] WebSocket 연결 관리 구현
- [ ] 실시간 업데이트 브로드캐스트 구현
- [ ] 연결 상태 관리 구현
- [ ] 재연결 로직 구현

### 12.10 성능 최적화
- [ ] 데이터베이스 쿼리 최적화
- [ ] 인덱스 최적화
- [ ] 캐싱 전략 구현
- [ ] API 응답 최적화
- [ ] 이미지 최적화
- [ ] CDN 설정

### 12.11 보안
- [ ] 입력 검증 구현
- [ ] SQL 인젝션 방지
- [ ] XSS 방지
- [ ] CSRF 보호
- [ ] Rate Limiting 구현
- [ ] 보안 헤더 설정

### 12.12 테스트
- [ ] Jest 설정
- [ ] API 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] 디스코드 봇 테스트 작성
- [ ] 성능 테스트 작성
- [ ] 보안 테스트 작성

### 12.13 모니터링 및 로깅
- [ ] 구조화된 로깅 구현
- [ ] 에러 추적 설정
- [ ] 성능 모니터링 설정
- [ ] 알림 설정
- [ ] 대시보드 구성

### 12.14 배포 준비
- [ ] 환경 변수 설정
- [ ] Vercel 배포 설정
- [ ] Supabase 프로덕션 설정
- [ ] 도메인 설정
- [ ] SSL 인증서 설정
- [ ] 백업 전략 수립

### 12.15 문서화
- [ ] API 문서 작성 (Swagger/OpenAPI)
- [ ] 데이터베이스 스키마 문서 작성
- [ ] 디스코드 봇 사용법 문서 작성
- [ ] 배포 가이드 작성
- [ ] 개발 가이드 작성

## 13. 개발 일정 (예상)

### Phase 1: 기반 설정 (1주)
- 프로젝트 초기 설정
- 데이터베이스 스키마 설계 및 구현
- 소셜 로그인 (카카오, 구글) 인증 시스템 구현

### Phase 2: 핵심 API (2주)
- 업무 관리 API 구현
- 팀 관리 API 구현
- 기본 CRUD 기능 완성

### Phase 3: 고급 기능 (1.5주)
- 디스코드 봇 연동
- 실시간 알림 시스템
- 파일 관리 기능

### Phase 4: 최적화 및 배포 (0.5주)
- 성능 최적화
- 보안 강화
- 배포 및 테스트

## 14. 위험 요소 및 대응 방안

### 14.1 기술적 위험
- **Supabase 제한사항**: 서버리스 환경의 제약
  - 대응: 대안 솔루션 검토 및 최적화
- **Discord API 제한**: 봇 API 호출 제한
  - 대응: Rate limiting 및 큐 시스템 구현

### 14.2 보안 위험
- **데이터 유출**: 사용자 데이터 보호
  - 대응: RLS 정책 및 암호화 적용
- **API 남용**: 무분별한 API 호출
  - 대응: Rate limiting 및 인증 강화

### 14.3 성능 위험
- **데이터베이스 성능**: 대용량 데이터 처리
  - 대응: 인덱스 최적화 및 캐싱 전략

## 15. 참고 자료

### 15.1 기술 문서
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Supabase 문서](https://supabase.com/docs)
- [Discord.js 문서](https://discord.js.org/#/docs)
- [Zod 검증 라이브러리](https://zod.dev/)

### 15.2 보안 참고
- [OWASP 보안 가이드](https://owasp.org/)
- [JWT 보안 모범 사례](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**문서 버전**: 1.0  
**작성일**: 2024년 12월  
**최종 수정일**: 2024년 12월  
**작성자**: 개발팀
