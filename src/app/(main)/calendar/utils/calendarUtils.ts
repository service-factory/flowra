import { CalendarTask } from '../types/calendar';

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

export const getPriorityIcon = (priority: string) => {
  switch (priority) {
    case "urgent": return "🚨";
    case "high": return "🔺";
    case "medium": return "🔸";
    case "low": return "🔹";
    default: return "🔹";
  }
};

export const getGoogleCalendarColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 border-l-4 border-green-500";
    case "in_progress": return "bg-blue-100 text-blue-800 border-l-4 border-blue-500";
    case "pending": return "bg-gray-100 text-gray-800 border-l-4 border-gray-400";
    case "overdue": return "bg-red-100 text-red-800 border-l-4 border-red-500";
    default: return "bg-gray-100 text-gray-800 border-l-4 border-gray-400";
  }
};

export const formatDateTitle = (currentDate: Date, viewMode: 'month' | 'week' | 'day') => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  
  switch (viewMode) {
    case "month":
      return `${year}년 ${month}월`;
    case "week":
      const startOfWeek = new Date(currentDate);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}`;
    case "day":
      return `${year}년 ${month}월 ${currentDate.getDate()}일`;
    default:
      return "";
  }
};

export const groupTasksByDate = (tasks: CalendarTask[]) => {
  const grouped: { [key: string]: CalendarTask[] } = {};
  
  tasks.forEach(task => {
    if (task.due_date) {
      const dateKey = task.due_date.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(task);
    }
  });
  
  return grouped;
};
