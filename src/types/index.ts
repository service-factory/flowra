// 사용자 관련 타입
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'kakao' | 'google' | 'unknown';
  provider_id: string;
  discord_id?: string;
  timezone: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

// 팀 관련 타입
export interface Team {
  id: string;
  name: string;
  description?: string;
  slug: string;
  owner_id: string;
  discord_guild_id?: string;
  discord_channel_id?: string;
  settings: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: Record<string, unknown>;
  is_active: boolean;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

// 프로젝트 관련 타입
export interface Project {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  settings: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// 업무 관련 타입
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  team_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  creator_id?: string;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  assignee?: User;
  creator?: User;
  project?: Project;
  tags?: TaskTag[];
  comments?: TaskComment[];
}

export interface TaskTag {
  id: string;
  task_id: string;
  tag: string;
  color: string;
  created_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field_name?: string;
  old_value?: unknown;
  new_value?: unknown;
  comment?: string;
  created_at: string;
  user?: User;
}

// 알림 관련 타입
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content?: string;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  created_at: string;
}

// 파일 관련 타입
export interface File {
  id: string;
  task_id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  thumbnail_url?: string;
  is_public: boolean;
  created_at: string;
  user?: User;
}

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 필터 및 검색 타입
export interface TaskFilters {
  status?: TaskStatus[];
  assigneeId?: string;
  priority?: TaskPriority[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
  projectId?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 권한 관련 타입
export enum Permission {
  TASK_CREATE = 'task:create',
  TASK_READ = 'task:read',
  TASK_UPDATE = 'task:update',
  TASK_DELETE = 'task:delete',
  TEAM_MANAGE = 'team:manage',
  MEMBER_INVITE = 'member:invite',
  MEMBER_REMOVE = 'member:remove',
  DISCORD_CONNECT = 'discord:connect',
}

export type TeamRole = 'admin' | 'member' | 'viewer';

// OAuth 관련 타입
export interface OAuthCallbackResponse {
  user: User;
  session: unknown;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  provider: 'kakao' | 'google' | 'unknown';
}

// 앱 상태 타입
export interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    provider: 'kakao' | 'google' | null;
  };
  tasks: {
    items: Task[];
    filters: TaskFilters;
    pagination: PaginationState;
    isLoading: boolean;
  };
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Notification[];
  };
  team: {
    members: TeamMember[];
    currentProject: Project | null;
  };
}
