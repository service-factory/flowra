export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'pending' | 'cancelled' | 'on_hold';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  due_date?: string;
  assignee_id?: string;
  assignee?: {
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  project_id?: string;
  tags?: Array<{ id: string; tag: string } | string>;
}

export interface CalendarTeamMember {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface CalendarProject {
  id: string;
  name: string;
}

export interface CalendarTeamData {
  tasks?: CalendarTask[];
  members?: CalendarTeamMember[];
  projects?: CalendarProject[];
}

export type ViewMode = 'month' | 'week' | 'day';

export interface TaskCreateInitials {
  initialStatus?: string;
  initialDueDate?: string;
}

export interface TasksByDate {
  [key: string]: CalendarTask[];
}
