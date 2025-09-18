// 상태별 색상 반환
export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50";
    case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50";
    case "pending": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800/50";
    case "overdue": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50";
    default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50";
  }
};

// 상태별 텍스트 반환
export const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "완료";
    case "in_progress": return "진행중";
    case "pending": return "대기";
    case "overdue": return "지연";
    default: return status;
  }
};

// 우선순위별 색상 반환
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "text-red-600 dark:text-red-400";
    case "medium": return "text-amber-600 dark:text-amber-400";
    case "low": return "text-emerald-600 dark:text-emerald-400";
    default: return "text-slate-500 dark:text-slate-400";
  }
};

// 우선순위별 아이콘 타입 반환 (컴포넌트에서 사용)
export const getPriorityIconType = (priority: string) => {
  switch (priority) {
    case "high": return "triangle";
    case "medium": return "square";
    case "low": return "circle";
    default: return "circle";
  }
};

// 태그별 색상 매핑
export const getTagColor = (tag: string) => {
  const colors = [
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50",
    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50",
    "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/50",
    "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
    "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50",
    "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50",
    "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800/50",
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800/50"
  ];
  const index = tag.charCodeAt(0) % colors.length;
  return colors[index];
};

// 날짜 유틸리티 함수들
export const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

export const isThisWeek = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = (day + 6) % 7; // Monday as start
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return d >= new Date(monday.toDateString()) && d <= new Date(sunday.toDateString());
};
