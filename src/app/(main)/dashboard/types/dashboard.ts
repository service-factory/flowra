export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  teamMembers: number;
  thisWeekProgress: number;
}

export interface RecentActivity {
  id: string;
  type: 'task_completed' | 'task_created' | 'comment_added';
  message: string;
  timestamp: string;
  user: {
    name: string;
    avatar: string;
  };
}

export interface DiscordStatus {
  connected: boolean;
  guild?: {
    name: string;
    icon?: string;
  };
  loading: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'pending';
  priority: 'high' | 'medium' | 'low';
  assignee_id?: string;
  due_date?: string;
  progress?: number;
}

export interface TeamMember {
  id: string;
  full_name?: string;
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
}
