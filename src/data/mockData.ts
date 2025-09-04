import { 
  User, 
  Team, 
  TeamMember, 
  Project, 
  Task, 
  TaskTag, 
  TeamTag, 
  TaskWithDetails,
  TeamWithMembers 
} from '@/types/database';

// Mock Users
export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "kim.design@flowra.com",
    name: "김디자인",
    avatar_url: "/avatars/kim.jpg",
    provider: "kakao",
    provider_id: "kakao_123456",
    discord_id: "kim_design#1234",
    timezone: "Asia/Seoul",
    email_verified: true,
    is_active: true,
    last_login_at: "2025-09-04T10:30:00Z",
    created_at: "2025-08-01T09:00:00Z",
    updated_at: "2025-09-04T10:30:00Z"
  },
  {
    id: "user-2",
    email: "pm.lee@flowra.com",
    name: "이PM",
    avatar_url: "/avatars/pm.jpg",
    provider: "google",
    provider_id: "google_789012",
    discord_id: "pm_lee#5678",
    timezone: "Asia/Seoul",
    email_verified: true,
    is_active: true,
    last_login_at: "2025-09-04T11:15:00Z",
    created_at: "2025-07-15T08:30:00Z",
    updated_at: "2025-09-04T11:15:00Z"
  },
  {
    id: "user-3",
    email: "dev.lee@flowra.com",
    name: "이개발",
    avatar_url: "/avatars/lee.jpg",
    provider: "kakao",
    provider_id: "kakao_345678",
    discord_id: "dev_lee#9012",
    timezone: "Asia/Seoul",
    email_verified: true,
    is_active: true,
    last_login_at: "2025-09-04T09:45:00Z",
    created_at: "2025-08-10T14:20:00Z",
    updated_at: "2025-09-04T09:45:00Z"
  },
  {
    id: "user-4",
    email: "backend.park@flowra.com",
    name: "박백엔드",
    avatar_url: "/avatars/park.jpg",
    provider: "google",
    provider_id: "google_456789",
    discord_id: "backend_park#3456",
    timezone: "Asia/Seoul",
    email_verified: true,
    is_active: true,
    last_login_at: "2025-09-03T16:20:00Z",
    created_at: "2025-07-20T11:10:00Z",
    updated_at: "2025-09-03T16:20:00Z"
  },
  {
    id: "user-5",
    email: "test.choi@flowra.com",
    name: "최테스트",
    avatar_url: "/avatars/choi.jpg",
    provider: "kakao",
    provider_id: "kakao_567890",
    discord_id: "test_choi#7890",
    timezone: "Asia/Seoul",
    email_verified: true,
    is_active: true,
    last_login_at: "2025-09-04T08:30:00Z",
    created_at: "2025-08-05T13:45:00Z",
    updated_at: "2025-09-04T08:30:00Z"
  }
];

// Mock Team
export const mockTeam: Team = {
  id: "team-1",
  name: "Flowra Team",
  description: "사이드 프로젝트 팀을 위한 업무 관리 시스템 개발팀",
  slug: "flowra-team",
  owner_id: "user-2",
  discord_guild_id: "123456789012345678",
  discord_channel_id: "987654321098765432",
  settings: {
    timezone: "Asia/Seoul",
    working_hours: { start: "09:00", end: "18:00" },
    notification_settings: {
      email: true,
      discord: true,
      push: true
    }
  },
  is_active: true,
  created_at: "2025-07-01T00:00:00Z",
  updated_at: "2025-09-04T12:00:00Z"
};

// Mock Team Members
export const mockTeamMembers: TeamMember[] = [
  {
    id: "member-1",
    team_id: "team-1",
    user_id: "user-1",
    role: "member",
    permissions: { can_create_tasks: true, can_assign_tasks: true },
    is_active: true,
    invited_by: "user-2",
    invited_at: "2025-07-01T00:00:00Z",
    joined_at: "2025-07-01T00:00:00Z",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-07-01T00:00:00Z"
  },
  {
    id: "member-2",
    team_id: "team-1",
    user_id: "user-2",
    role: "admin",
    permissions: { can_create_tasks: true, can_assign_tasks: true, can_manage_team: true },
    is_active: true,
    invited_at: "2025-07-01T00:00:00Z",
    joined_at: "2025-07-01T00:00:00Z",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-07-01T00:00:00Z"
  },
  {
    id: "member-3",
    team_id: "team-1",
    user_id: "user-3",
    role: "member",
    permissions: { can_create_tasks: true, can_assign_tasks: true },
    is_active: true,
    invited_by: "user-2",
    invited_at: "2025-08-10T00:00:00Z",
    joined_at: "2025-08-10T00:00:00Z",
    created_at: "2025-08-10T00:00:00Z",
    updated_at: "2025-08-10T00:00:00Z"
  },
  {
    id: "member-4",
    team_id: "team-1",
    user_id: "user-4",
    role: "member",
    permissions: { can_create_tasks: true, can_assign_tasks: true },
    is_active: true,
    invited_by: "user-2",
    invited_at: "2025-07-20T00:00:00Z",
    joined_at: "2025-07-20T00:00:00Z",
    created_at: "2025-07-20T00:00:00Z",
    updated_at: "2025-07-20T00:00:00Z"
  },
  {
    id: "member-5",
    team_id: "team-1",
    user_id: "user-5",
    role: "member",
    permissions: { can_create_tasks: true, can_assign_tasks: true },
    is_active: true,
    invited_by: "user-2",
    invited_at: "2025-08-05T00:00:00Z",
    joined_at: "2025-08-05T00:00:00Z",
    created_at: "2025-08-05T00:00:00Z",
    updated_at: "2025-08-05T00:00:00Z"
  }
];

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: "project-1",
    team_id: "team-1",
    name: "사용자 인터페이스",
    description: "프론트엔드 UI/UX 개발 프로젝트",
    color: "#3B82F6",
    icon: "🎨",
    is_active: true,
    settings: { sprint_duration: 14, story_point_scale: "fibonacci" },
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-25T00:00:00Z"
  },
  {
    id: "project-2",
    team_id: "team-1",
    name: "백엔드 개발",
    description: "API 및 서버 개발 프로젝트",
    color: "#10B981",
    icon: "⚙️",
    is_active: true,
    settings: { sprint_duration: 14, story_point_scale: "fibonacci" },
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-28T00:00:00Z"
  },
  {
    id: "project-3",
    team_id: "team-1",
    name: "데이터베이스",
    description: "데이터베이스 설계 및 최적화",
    color: "#8B5CF6",
    icon: "🗄️",
    is_active: true,
    settings: { sprint_duration: 14, story_point_scale: "fibonacci" },
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-20T00:00:00Z"
  },
  {
    id: "project-4",
    team_id: "team-1",
    name: "품질 보증",
    description: "테스트 및 QA 프로젝트",
    color: "#F59E0B",
    icon: "🧪",
    is_active: true,
    settings: { sprint_duration: 14, story_point_scale: "fibonacci" },
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-27T00:00:00Z"
  },
  {
    id: "project-5",
    team_id: "team-1",
    name: "인증 시스템",
    description: "사용자 인증 및 보안 시스템",
    color: "#F43F5E",
    icon: "🔐",
    is_active: true,
    settings: { sprint_duration: 14, story_point_scale: "fibonacci" },
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-24T00:00:00Z"
  }
];

// Mock Team Tags
export const mockTeamTags: TeamTag[] = [
  {
    id: "tag-1",
    team_id: "team-1",
    name: "디자인",
    color: "#3B82F6",
    description: "UI/UX 디자인 관련 업무",
    is_active: true,
    usage_count: 3,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-25T00:00:00Z"
  },
  {
    id: "tag-2",
    team_id: "team-1",
    name: "UI/UX",
    color: "#8B5CF6",
    description: "사용자 인터페이스 및 경험",
    is_active: true,
    usage_count: 2,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-25T00:00:00Z"
  },
  {
    id: "tag-3",
    team_id: "team-1",
    name: "프론트엔드",
    color: "#06B6D4",
    description: "프론트엔드 개발 관련",
    is_active: true,
    usage_count: 2,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-25T00:00:00Z"
  },
  {
    id: "tag-4",
    team_id: "team-1",
    name: "백엔드",
    color: "#10B981",
    description: "백엔드 개발 관련",
    is_active: true,
    usage_count: 2,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-26T00:00:00Z"
  },
  {
    id: "tag-5",
    team_id: "team-1",
    name: "API",
    color: "#6366F1",
    description: "API 개발 및 연동",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-26T00:00:00Z"
  },
  {
    id: "tag-6",
    team_id: "team-1",
    name: "개발",
    color: "#F97316",
    description: "일반적인 개발 업무",
    is_active: true,
    usage_count: 2,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-26T00:00:00Z"
  },
  {
    id: "tag-7",
    team_id: "team-1",
    name: "데이터베이스",
    color: "#8B5CF6",
    description: "데이터베이스 관련 업무",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-20T00:00:00Z"
  },
  {
    id: "tag-8",
    team_id: "team-1",
    name: "설계",
    color: "#6B7280",
    description: "시스템 설계 관련",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-20T00:00:00Z"
  },
  {
    id: "tag-9",
    team_id: "team-1",
    name: "완료",
    color: "#10B981",
    description: "완료된 업무",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-07-01T00:00:00Z",
    updated_at: "2025-08-28T00:00:00Z"
  },
  {
    id: "tag-10",
    team_id: "team-1",
    name: "테스트",
    color: "#F59E0B",
    description: "테스트 관련 업무",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-27T00:00:00Z"
  },
  {
    id: "tag-11",
    team_id: "team-1",
    name: "QA",
    color: "#F59E0B",
    description: "품질 보증 관련",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-27T00:00:00Z"
  },
  {
    id: "tag-12",
    team_id: "team-1",
    name: "인증",
    color: "#F43F5E",
    description: "인증 시스템 관련",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-24T00:00:00Z"
  },
  {
    id: "tag-13",
    team_id: "team-1",
    name: "보안",
    color: "#DC2626",
    description: "보안 관련 업무",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-24T00:00:00Z"
  },
  {
    id: "tag-14",
    team_id: "team-1",
    name: "소셜로그인",
    color: "#EC4899",
    description: "소셜 로그인 관련",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-08-01T00:00:00Z",
    updated_at: "2025-08-24T00:00:00Z"
  },
  {
    id: "tag-15",
    team_id: "team-1",
    name: "모바일",
    color: "#7C3AED",
    description: "모바일 관련 업무",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-09-01T00:00:00Z",
    updated_at: "2025-08-28T00:00:00Z"
  },
  {
    id: "tag-16",
    team_id: "team-1",
    name: "반응형",
    color: "#059669",
    description: "반응형 디자인 관련",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-09-01T00:00:00Z",
    updated_at: "2025-08-28T00:00:00Z"
  },
  {
    id: "tag-17",
    team_id: "team-1",
    name: "UI",
    color: "#0891B2",
    description: "사용자 인터페이스",
    is_active: true,
    usage_count: 1,
    created_by: "user-2",
    created_at: "2025-09-01T00:00:00Z",
    updated_at: "2025-08-28T00:00:00Z"
  }
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: "task-1",
    team_id: "team-1",
    project_id: "project-1",
    title: "홈페이지 디자인 완성",
    description: "메인 페이지 UI/UX 디자인 및 반응형 구현을 완료해야 합니다. 사용자 경험을 최우선으로 고려하여 직관적인 인터페이스를 설계합니다.",
    status: "in_progress",
    priority: "high",
    assignee_id: "user-1",
    creator_id: "user-2",
    due_date: "2025-09-10T23:59:59Z",
    estimated_hours: 16,
    actual_hours: 12,
    position: 1,
    metadata: { story_points: 8, epic: "사용자 인터페이스", sprint: "Sprint 1" },
    created_at: "2025-08-25T09:00:00Z",
    updated_at: "2025-09-03T14:30:00Z"
  },
  {
    id: "task-2",
    team_id: "team-1",
    project_id: "project-2",
    title: "API 연동 작업",
    description: "백엔드 API와 프론트엔드 연동 작업을 진행합니다. RESTful API 설계 원칙에 따라 구현하고, 에러 핸들링을 철저히 해야 합니다.",
    status: "pending",
    priority: "medium",
    assignee_id: "user-3",
    creator_id: "user-2",
    due_date: "2025-09-12T23:59:59Z",
    estimated_hours: 20,
    position: 2,
    metadata: { story_points: 13, epic: "백엔드 개발", sprint: "Sprint 1" },
    created_at: "2025-08-26T10:15:00Z",
    updated_at: "2025-08-27T16:45:00Z"
  },
  {
    id: "task-3",
    team_id: "team-1",
    project_id: "project-3",
    title: "데이터베이스 설계",
    description: "사용자 및 업무 관리 테이블 설계를 완료했습니다. 정규화를 통해 데이터 무결성을 보장하고, 인덱스를 최적화했습니다.",
    status: "completed",
    priority: "high",
    assignee_id: "user-4",
    creator_id: "user-2",
    due_date: "2025-08-28T23:59:59Z",
    completed_at: "2025-08-28T17:30:00Z",
    estimated_hours: 24,
    actual_hours: 21,
    position: 3,
    metadata: { story_points: 21, epic: "데이터베이스", sprint: "Sprint 0" },
    created_at: "2025-08-20T08:30:00Z",
    updated_at: "2025-08-28T17:30:00Z"
  },
  {
    id: "task-4",
    team_id: "team-1",
    project_id: "project-4",
    title: "테스트 코드 작성",
    description: "단위 테스트 및 통합 테스트 작성이 필요합니다. Jest와 React Testing Library를 사용하여 테스트 커버리지를 90% 이상 달성해야 합니다.",
    status: "pending",
    priority: "low",
    assignee_id: "user-5",
    creator_id: "user-2",
    due_date: "2025-09-15T23:59:59Z",
    estimated_hours: 12,
    position: 4,
    metadata: { story_points: 5, epic: "품질 보증", sprint: "Sprint 2" },
    created_at: "2025-08-27T11:20:00Z",
    updated_at: "2025-08-27T11:20:00Z"
  },
  {
    id: "task-5",
    team_id: "team-1",
    project_id: "project-5",
    title: "사용자 인증 시스템",
    description: "소셜 로그인 (카카오, 구글) 인증 시스템을 구현합니다. JWT 토큰 기반 인증과 보안을 강화해야 합니다.",
    status: "in_progress",
    priority: "high",
    assignee_id: "user-3",
    creator_id: "user-2",
    due_date: "2025-09-11T23:59:59Z",
    estimated_hours: 18,
    actual_hours: 11,
    position: 5,
    metadata: { story_points: 13, epic: "인증 시스템", sprint: "Sprint 1" },
    created_at: "2025-08-24T13:45:00Z",
    updated_at: "2025-09-04T09:15:00Z"
  },
  {
    id: "task-6",
    team_id: "team-1",
    project_id: "project-1",
    title: "모바일 반응형 최적화",
    description: "모바일 디바이스에서의 사용자 경험을 개선하기 위한 반응형 최적화 작업을 진행합니다.",
    status: "pending",
    priority: "medium",
    assignee_id: "user-1",
    creator_id: "user-2",
    due_date: "2025-09-13T23:59:59Z",
    estimated_hours: 14,
    position: 6,
    metadata: { story_points: 8, epic: "사용자 인터페이스", sprint: "Sprint 2" },
    created_at: "2025-08-28T15:30:00Z",
    updated_at: "2025-08-28T15:30:00Z"
  },
  {
    id: "task-7",
    team_id: "team-1",
    project_id: "project-2",
    title: "데이터베이스 마이그레이션 스크립트",
    description: "프로덕션 환경을 위한 데이터베이스 마이그레이션 스크립트를 작성하고 테스트합니다.",
    status: "pending",
    priority: "medium",
    assignee_id: "user-4",
    creator_id: "user-2",
    due_date: "2025-09-14T23:59:59Z",
    estimated_hours: 8,
    position: 7,
    metadata: { story_points: 5, epic: "백엔드 개발", sprint: "Sprint 2" },
    created_at: "2025-09-04T10:00:00Z",
    updated_at: "2025-09-04T10:00:00Z"
  },
  {
    id: "task-8",
    team_id: "team-1",
    project_id: "project-1",
    title: "사용자 대시보드 UI 구현",
    description: "사용자 대시보드의 메인 UI 컴포넌트를 구현하고 상태 관리를 설정합니다.",
    status: "in_progress",
    priority: "high",
    assignee_id: "user-1",
    creator_id: "user-2",
    due_date: "2025-09-16T23:59:59Z",
    estimated_hours: 20,
    actual_hours: 8,
    position: 8,
    metadata: { story_points: 13, epic: "사용자 인터페이스", sprint: "Sprint 2" },
    created_at: "2025-09-04T08:00:00Z",
    updated_at: "2025-09-04T16:20:00Z"
  }
];

// Mock Task Tags
export const mockTaskTags: TaskTag[] = [
  // Task 1 tags
  { id: "task-tag-1", task_id: "task-1", tag: "디자인", color: "#3B82F6", created_at: "2025-08-25T09:00:00Z" },
  { id: "task-tag-2", task_id: "task-1", tag: "UI/UX", color: "#8B5CF6", created_at: "2025-08-25T09:00:00Z" },
  { id: "task-tag-3", task_id: "task-1", tag: "프론트엔드", color: "#06B6D4", created_at: "2025-08-25T09:00:00Z" },
  
  // Task 2 tags
  { id: "task-tag-4", task_id: "task-2", tag: "백엔드", color: "#10B981", created_at: "2025-08-26T10:15:00Z" },
  { id: "task-tag-5", task_id: "task-2", tag: "API", color: "#6366F1", created_at: "2025-08-26T10:15:00Z" },
  { id: "task-tag-6", task_id: "task-2", tag: "개발", color: "#F97316", created_at: "2025-08-26T10:15:00Z" },
  
  // Task 3 tags
  { id: "task-tag-7", task_id: "task-3", tag: "데이터베이스", color: "#8B5CF6", created_at: "2025-08-20T08:30:00Z" },
  { id: "task-tag-8", task_id: "task-3", tag: "설계", color: "#6B7280", created_at: "2025-08-20T08:30:00Z" },
  { id: "task-tag-9", task_id: "task-3", tag: "완료", color: "#10B981", created_at: "2025-08-28T17:30:00Z" },
  
  // Task 4 tags
  { id: "task-tag-10", task_id: "task-4", tag: "테스트", color: "#F59E0B", created_at: "2025-08-27T11:20:00Z" },
  { id: "task-tag-11", task_id: "task-4", tag: "QA", color: "#F59E0B", created_at: "2025-08-27T11:20:00Z" },
  { id: "task-tag-12", task_id: "task-4", tag: "개발", color: "#F97316", created_at: "2025-08-27T11:20:00Z" },
  
  // Task 5 tags
  { id: "task-tag-13", task_id: "task-5", tag: "인증", color: "#F43F5E", created_at: "2025-08-24T13:45:00Z" },
  { id: "task-tag-14", task_id: "task-5", tag: "보안", color: "#DC2626", created_at: "2025-08-24T13:45:00Z" },
  { id: "task-tag-15", task_id: "task-5", tag: "소셜로그인", color: "#EC4899", created_at: "2025-08-24T13:45:00Z" },
  
  // Task 6 tags
  { id: "task-tag-16", task_id: "task-6", tag: "모바일", color: "#7C3AED", created_at: "2025-08-28T15:30:00Z" },
  { id: "task-tag-17", task_id: "task-6", tag: "반응형", color: "#059669", created_at: "2025-08-28T15:30:00Z" },
  { id: "task-tag-18", task_id: "task-6", tag: "UI", color: "#0891B2", created_at: "2025-08-28T15:30:00Z" },
  
  // Task 7 tags
  { id: "task-tag-19", task_id: "task-7", tag: "데이터베이스", color: "#8B5CF6", created_at: "2025-09-04T10:00:00Z" },
  { id: "task-tag-20", task_id: "task-7", tag: "백엔드", color: "#10B981", created_at: "2025-09-04T10:00:00Z" },
  { id: "task-tag-21", task_id: "task-7", tag: "개발", color: "#F97316", created_at: "2025-09-04T10:00:00Z" },
  
  // Task 8 tags
  { id: "task-tag-22", task_id: "task-8", tag: "UI/UX", color: "#8B5CF6", created_at: "2025-09-04T08:00:00Z" },
  { id: "task-tag-23", task_id: "task-8", tag: "프론트엔드", color: "#06B6D4", created_at: "2025-09-04T08:00:00Z" },
  { id: "task-tag-24", task_id: "task-8", tag: "개발", color: "#F97316", created_at: "2025-09-04T08:00:00Z" }
];

// Helper function to create TaskWithDetails
export function createTaskWithDetails(task: Task): TaskWithDetails {
  const assignee = mockUsers.find(u => u.id === task.assignee_id);
  const creator = mockUsers.find(u => u.id === task.creator_id);
  const project = mockProjects.find(p => p.id === task.project_id);
  const tags = mockTaskTags.filter(tt => tt.task_id === task.id);
  
  return {
    ...task,
    assignee,
    creator,
    project,
    tags,
    comments_count: Math.floor(Math.random() * 5), // Mock comment count
    files_count: Math.floor(Math.random() * 3) // Mock file count
  };
}

// Export all tasks with details
export const mockTasksWithDetails: TaskWithDetails[] = mockTasks.map(createTaskWithDetails);

// Helper function to get team with members
export function getTeamWithMembers(): TeamWithMembers {
  const members = mockTeamMembers.map(member => ({
    ...member,
    user: mockUsers.find(u => u.id === member.user_id)!
  }));

  return {
    ...mockTeam,
    members,
    projects: mockProjects
  };
}
