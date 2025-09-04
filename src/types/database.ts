// Database types based on db.md schema

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'kakao' | 'google';
  provider_id: string;
  discord_id?: string;
  timezone: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  slug: string;
  owner_id: string;
  discord_guild_id?: string;
  discord_channel_id?: string;
  discord_bot_token_encrypted?: string;
  settings: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: Record<string, any>;
  is_active: boolean;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  team_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  team_id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee_id?: string;
  creator_id?: string;
  due_date?: string;
  completed_at?: string;
  estimated_hours?: number;
  actual_hours?: number;
  position: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TaskTag {
  id: string;
  task_id: string;
  tag: string;
  color: string;
  created_at: string;
}

export interface TeamTag {
  id: string;
  team_id: string;
  name: string;
  color: string;
  description?: string;
  is_active: boolean;
  usage_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
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
}

export interface TaskHistory {
  id: string;
  task_id: string;
  user_id: string;
  action: string;
  field_name?: string;
  old_value?: any;
  new_value?: any;
  comment?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content?: string;
  data: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  expires_at?: string;
  created_at: string;
}

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
}

// Extended types for UI
export interface TaskWithDetails extends Task {
  assignee?: User;
  creator?: User;
  project?: Project;
  tags: TaskTag[];
  comments_count: number;
  files_count: number;
}

export interface UserWithTeam extends User {
  teams: TeamMember[];
}

export interface TeamWithMembers extends Team {
  members: (TeamMember & { user: User })[];
  projects: Project[];
}
