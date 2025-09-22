import { Task, TeamMember, Project } from '@/types';

export const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "완료";
    case "in_progress": return "진행중";
    case "pending": return "대기";
    case "cancelled": return "취소";
    case "on_hold": return "보류";
    default: return status;
  }
};

export const getPriorityText = (priority: string) => {
  switch (priority) {
    case "urgent": return "긴급";
    case "high": return "높음";
    case "medium": return "보통";
    case "low": return "낮음";
    default: return priority;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "cancelled": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    case "on_hold": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent": return "text-red-500";
    case "high": return "text-orange-500";
    case "medium": return "text-yellow-500";
    case "low": return "text-green-500";
    default: return "text-gray-500";
  }
};

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "urgent": return "🚨";
    case "high": return "🔺";
    case "medium": return "🔸";
    case "low": return "🔹";
    default: return "🔹";
  }
};

export const isOverdue = (dueDate?: string) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

export const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return null;
  const date = new Date(dueDate);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "오늘";
  if (diffDays === 1) return "내일";
  if (diffDays === -1) return "어제";
  if (diffDays > 0) return `${diffDays}일 후`;
  if (diffDays < 0) return `${Math.abs(diffDays)}일 지연`;
  
  return date.toLocaleDateString('ko-KR');
};

export const getAssigneeName = (task: Task, teamMembers: TeamMember[]) => {
  if (task.assignee?.name) return task.assignee.name;
  if (task.assignee?.email) return task.assignee.email;
  if (task.assignee_id) {
    const member = teamMembers.find(m => m.id === task.assignee_id);
    return member?.user?.name || member?.user?.email || '미할당';
  }
  return '미할당';
};

export const getProjectName = (task: Task, projects: Project[]) => {
  if (task.project?.name) return task.project.name;
  if (task.project_id) {
    const project = projects.find(p => p.id === task.project_id);
    return project?.name || '프로젝트 없음';
  }
  return '프로젝트 없음';
};

export const filterTasks = (
  tasks: Task[],
  filters: {
    searchTerm: string;
    showCompleted: boolean;
    selectedTags: string[];
    assigneeFilter: string;
    dueFilter: string;
    priorityFilter: string;
  },
  teamMembers: TeamMember[]
) => {
  return tasks.filter(task => {
    // 검색어 필터
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descriptionMatch = task.description?.toLowerCase().includes(searchLower) || false;
      const assigneeMatch = getAssigneeName(task, teamMembers).toLowerCase().includes(searchLower);
      
      if (!titleMatch && !descriptionMatch && !assigneeMatch) {
        return false;
      }
    }

    // 완료 상태 필터
    if (!filters.showCompleted && task.status === 'completed') {
      return false;
    }

    // 태그 필터
    if (filters.selectedTags.length > 0) {
      const taskTags = task.tags?.map(tag => 
        typeof tag === 'string' ? tag : tag.tag
      ) || [];
      const hasMatchingTag = filters.selectedTags.some(selectedTag => 
        taskTags.includes(selectedTag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // 담당자 필터
    if (filters.assigneeFilter && filters.assigneeFilter !== 'all') {
      if (filters.assigneeFilter === 'unassigned') {
        if (task.assignee_id) return false;
      } else {
        if (task.assignee_id !== filters.assigneeFilter) return false;
      }
    }

    // 마감일 필터
    if (filters.dueFilter) {
      const today = new Date();
      const taskDueDate = task.due_date ? new Date(task.due_date) : null;
      
      switch (filters.dueFilter) {
        case 'overdue':
          if (!taskDueDate || taskDueDate >= today || task.status === 'completed') return false;
          break;
        case 'today':
          if (!taskDueDate || !isSameDay(taskDueDate, today)) return false;
          break;
        case 'this_week':
          const weekEnd = new Date(today);
          weekEnd.setDate(today.getDate() + 7);
          if (!taskDueDate || taskDueDate < today || taskDueDate > weekEnd) return false;
          break;
        case 'no_due_date':
          if (taskDueDate) return false;
          break;
      }
    }

    // 우선순위 필터
    if (filters.priorityFilter && filters.priorityFilter !== 'all') {
      if (task.priority !== filters.priorityFilter) return false;
    }

    return true;
  });
};

const isSameDay = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};
