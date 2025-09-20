// 알림 시스템 타입 정의

export type NotificationType = 
  | 'task_assigned'        // 태스크 할당
  | 'task_due'            // 태스크 마감일 임박
  | 'task_overdue'        // 태스크 지연
  | 'task_completed'      // 태스크 완료
  | 'task_updated'        // 태스크 수정
  | 'task_comment'        // 태스크 댓글
  | 'team_invitation'     // 팀 초대
  | 'team_member_joined'  // 팀원 가입
  | 'team_member_left'    // 팀원 탈퇴
  | 'project_created'     // 프로젝트 생성
  | 'project_updated'     // 프로젝트 수정
  | 'system'              // 시스템 알림
  | 'mention';            // 멘션

export type NotificationChannel = 'email' | 'push' | 'discord' | 'in_app';

export interface NotificationData {
  // 공통 데이터
  id?: string;
  user_id?: string;
  team_id?: string;
  
  // 태스크 관련
  task_id?: string;
  task_title?: string;
  task_status?: string;
  
  // 프로젝트 관련
  project_id?: string;
  project_name?: string;
  
  // 팀 관련
  team_name?: string;
  inviter_name?: string;
  
  // 댓글 관련
  comment_id?: string;
  commenter_name?: string;
  
  // 기타
  [key: string]: unknown;
}

export interface NotificationPreference {
  id: string;
  user_id: string | null;
  type: string;
  email_enabled: boolean | null;
  push_enabled: boolean | null;
  discord_enabled: boolean | null;
  in_app_enabled?: boolean; // 옵셔널로 변경 (데이터베이스에 없을 수 있음)
  quiet_hours_start?: string | null; // HH:MM 형식
  quiet_hours_end?: string | null;   // HH:MM 형식
  created_at: string | null;
  updated_at: string | null;
}

export interface Notification {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  content: string | null;
  data: any; // Json 타입
  is_read: boolean | null;
  read_at: string | null;
  expires_at: string | null;
  created_at: string | null;
}

export interface CreateNotificationRequest {
  user_id: string;
  type: NotificationType;
  title: string;
  content?: string;
  data?: NotificationData;
  expires_at?: string;
}

export interface UpdateNotificationRequest {
  is_read?: boolean;
  read_at?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total_count: number;
  unread_count: number;
  has_more: boolean;
}

export interface NotificationPreferencesResponse {
  preferences: NotificationPreference[];
  default_preferences: Record<NotificationType, {
    email_enabled: boolean;
    push_enabled: boolean;
    discord_enabled: boolean;
    in_app_enabled: boolean;
  }>;
}

// 알림 템플릿
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  content: string;
  channels: NotificationChannel[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  auto_expire_hours?: number;
}

// 알림 배치 작업
export interface NotificationBatch {
  notifications: CreateNotificationRequest[];
  send_immediately: boolean;
  scheduled_for?: string;
}
