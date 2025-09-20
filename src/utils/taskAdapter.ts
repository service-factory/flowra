import { TaskWithDetails } from "@/types/database";

// TaskWithDetails를 기존 TaskDetailDrawer가 기대하는 형식으로 변환하는 어댑터
export function adaptTaskForDrawer(task: TaskWithDetails) {
  return {
    id: task.id,
    title: task.title,
    description: task.description || "",
    status: task.status,
    priority: task.priority,
    assignee: task.assignee ? {
      id: task.assignee.id,
      name: task.assignee.name,
      avatar: task.assignee.avatar_url || "/avatars/default.jpg",
      email: task.assignee.email
    } : {
      id: "",
      name: "미할당",
      avatar: "/avatars/default.jpg",
      email: ""
    },
    creator: task.creator ? {
      id: task.creator.id,
      name: task.creator.name,
      avatar: task.creator.avatar_url || "/avatars/default.jpg"
    } : {
      id: "",
      name: "알 수 없음",
      avatar: "/avatars/default.jpg"
    },
    dueDate: task.due_date ? task.due_date.split('T')[0] : "",
    createdAt: task.created_at.split('T')[0],
    updatedAt: task.updated_at.split('T')[0],
    progress: task.actual_hours && task.estimated_hours ? 
      Math.round((task.actual_hours / task.estimated_hours) * 100) : 0,
    tags: task.tags.map(tag => tag.tag),
    comments: task.comments_count,
    attachments: task.files_count,
    storyPoints: task.metadata?.story_points || 0,
    epic: task.metadata?.epic || "",
    sprint: task.metadata?.sprint || "",
    labels: task.tags.map(tag => tag.tag)
  };
}

// 기존 Task 형식을 TaskWithDetails로 변환하는 어댑터 (역방향)
export function adaptTaskFromDrawer(task: {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee?: { id: string; name: string; email: string; avatar: string };
  creator?: { id: string; name: string; avatar: string };
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  progress?: number;
  tags: string[];
  comments: number;
  attachments: number;
  storyPoints: number;
  epic: string;
  sprint: string;
}): TaskWithDetails {
  return {
    id: task.id,
    team_id: "team-1", // 기본값
    project_id: undefined,
    title: task.title,
    description: task.description,
    status: task.status as "pending" | "in_progress" | "completed" | "cancelled" | "on_hold",
    priority: task.priority as "low" | "medium" | "high" | "urgent",
    assignee_id: task.assignee?.id || undefined,
    creator_id: task.creator?.id || undefined,
    due_date: task.dueDate ? `${task.dueDate}T23:59:59Z` : undefined,
    completed_at: task.status === "completed" ? new Date().toISOString() : undefined,
    estimated_hours: task.storyPoints * 2, // 추정치
    actual_hours: task.progress ? (task.progress / 100) * (task.storyPoints * 2) : undefined,
    position: 0,
    metadata: {
      story_points: task.storyPoints,
      epic: task.epic,
      sprint: task.sprint
    },
    created_at: task.createdAt ? `${task.createdAt}T00:00:00Z` : new Date().toISOString(),
    updated_at: task.updatedAt ? `${task.updatedAt}T00:00:00Z` : new Date().toISOString(),
    assignee: task.assignee ? {
      id: task.assignee.id,
      email: task.assignee.email,
      name: task.assignee.name,
      avatar_url: task.assignee.avatar,
      provider: "kakao" as const,
      provider_id: "",
      timezone: "Asia/Seoul",
      email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : undefined,
    creator: task.creator ? {
      id: task.creator.id,
      email: "",
      name: task.creator.name,
      avatar_url: task.creator.avatar,
      provider: "kakao" as const,
      provider_id: "",
      timezone: "Asia/Seoul",
      email_verified: true,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } : undefined,
    project: undefined,
    tags: task.tags.map((tag: string, index: number) => ({
      id: `tag-${index}`,
      task_id: task.id,
      tag,
      color: "#6B7280",
      created_at: new Date().toISOString()
    })),
    comments_count: task.comments,
    files_count: task.attachments
  };
}
