export const getStatusColor = (status: string) => {
  switch (status) {
    case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "in_progress": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    case "overdue": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "completed": return "완료";
    case "in_progress": return "진행중";
    case "pending": return "대기";
    case "overdue": return "지연";
    default: return status;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high": return "text-red-500";
    case "medium": return "text-yellow-500";
    case "low": return "text-green-500";
    default: return "text-gray-500";
  }
};
