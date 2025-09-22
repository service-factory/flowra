export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date?: string;
  assignee_id?: string;
  assignee?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  project_id?: string;
  project?: {
    id: string;
    name: string;
  };
  tags?: Array<{ id: string; tag: string } | string>;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface TeamData {
  tasks?: Task[];
  members?: TeamMember[];
  projects?: Project[];
  tags?: Array<{ id: string; tag: string }>;
}

export type ViewMode = 'kanban' | 'list' | 'calendar';

export interface TaskCreateInitials {
  initialStatus?: string;
  initialDueDate?: string;
}

export interface TaskFilters {
  searchTerm: string;
  showCompleted: boolean;
  selectedTags: string[];
  assigneeFilter: string;
  dueFilter: string;
  priorityFilter: string;
}

export interface OptimisticUpdate {
  optimisticUpdate: (newTasks: Task[]) => void;
  revert: () => void;
}
