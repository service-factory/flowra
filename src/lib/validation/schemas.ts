import { z } from 'zod';

// 사용자 관련 스키마
export const userSchema = z.object({
  name: z.string().min(1, '이름은 필수입니다').max(255, '이름은 255자를 초과할 수 없습니다'),
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  timezone: z.string().default('Asia/Seoul'),
});

// 팀 관련 스키마
export const teamSchema = z.object({
  name: z.string().min(1, '팀 이름은 필수입니다').max(255, '팀 이름은 255자를 초과할 수 없습니다'),
  description: z.string().max(1000, '설명은 1000자를 초과할 수 없습니다').optional(),
  slug: z.string().min(1, '슬러그는 필수입니다').max(100, '슬러그는 100자를 초과할 수 없습니다'),
});

export const teamMemberSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요'),
  role: z.enum(['admin', 'member', 'viewer']).default('member'),
});

// 프로젝트 관련 스키마
export const projectSchema = z.object({
  name: z.string().min(1, '프로젝트 이름은 필수입니다').max(255, '프로젝트 이름은 255자를 초과할 수 없습니다'),
  description: z.string().max(1000, '설명은 1000자를 초과할 수 없습니다').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, '유효한 색상 코드를 입력해주세요').default('#3B82F6'),
  icon: z.string().max(50, '아이콘은 50자를 초과할 수 없습니다').optional(),
});

// 업무 관련 스키마
export const taskSchema = z.object({
  title: z.string().min(1, '업무 제목은 필수입니다').max(255, '업무 제목은 255자를 초과할 수 없습니다'),
  description: z.string().max(2000, '설명은 2000자를 초과할 수 없습니다').optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assignee_id: z.string().uuid('유효한 사용자 ID를 입력해주세요').optional(),
  due_date: z.string().datetime('유효한 날짜를 입력해주세요').optional(),
  estimated_hours: z.number().min(0, '예상 시간은 0 이상이어야 합니다').max(999.99, '예상 시간은 999.99를 초과할 수 없습니다').optional(),
  tags: z.array(z.string().max(50, '태그는 50자를 초과할 수 없습니다')).max(10, '태그는 10개를 초과할 수 없습니다').default([]),
  project_id: z.string().uuid('유효한 프로젝트 ID를 입력해주세요').optional(),
});

export const taskUpdateSchema = taskSchema.partial();

export const taskStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold']),
  comment: z.string().max(500, '댓글은 500자를 초과할 수 없습니다').optional(),
});

// 댓글 관련 스키마
export const commentSchema = z.object({
  content: z.string().min(1, '댓글 내용은 필수입니다').max(2000, '댓글은 2000자를 초과할 수 없습니다'),
  is_internal: z.boolean().default(false),
  parent_id: z.string().uuid('유효한 댓글 ID를 입력해주세요').optional(),
});

// 파일 관련 스키마
export const fileUploadSchema = z.object({
  task_id: z.string().uuid('유효한 업무 ID를 입력해주세요'),
  file: z.instanceof(File, '파일을 선택해주세요'),
});

// 알림 관련 스키마
export const notificationSchema = z.object({
  type: z.string().min(1, '알림 타입은 필수입니다'),
  title: z.string().min(1, '제목은 필수입니다').max(255, '제목은 255자를 초과할 수 없습니다'),
  content: z.string().max(1000, '내용은 1000자를 초과할 수 없습니다').optional(),
  data: z.record(z.any()).default({}),
  expires_at: z.string().datetime('유효한 만료 날짜를 입력해주세요').optional(),
});

// 검색 및 필터 스키마
export const taskFiltersSchema = z.object({
  status: z.array(z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'])).optional(),
  assignee_id: z.string().uuid('유효한 사용자 ID를 입력해주세요').optional(),
  priority: z.array(z.enum(['low', 'medium', 'high', 'urgent'])).optional(),
  due_date_from: z.string().datetime('유효한 시작 날짜를 입력해주세요').optional(),
  due_date_to: z.string().datetime('유효한 종료 날짜를 입력해주세요').optional(),
  search: z.string().max(255, '검색어는 255자를 초과할 수 없습니다').optional(),
  project_id: z.string().uuid('유효한 프로젝트 ID를 입력해주세요').optional(),
});

export const paginationSchema = z.object({
  page: z.number().min(1, '페이지는 1 이상이어야 합니다').default(1),
  limit: z.number().min(1, '제한은 1 이상이어야 합니다').max(100, '제한은 100을 초과할 수 없습니다').default(20),
});

// OAuth 관련 스키마
export const oauthCallbackSchema = z.object({
  code: z.string().min(1, '인증 코드는 필수입니다'),
  state: z.string().optional(),
});

// 디스코드 연동 스키마
export const discordConnectSchema = z.object({
  code: z.string().min(1, '인증 코드는 필수입니다'),
  guild_id: z.string().min(1, '길드 ID는 필수입니다'),
});

// API 응답 스키마
export const apiResponseSchema = z.object({
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

export const paginationResponseSchema = z.object({
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});
