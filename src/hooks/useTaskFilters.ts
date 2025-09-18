import { useState, useMemo } from 'react';
import { isToday, isThisWeek } from '@/lib/utils/taskUtils';

interface Task {
  id: string;
  title: string;
  description: string;
  tags: string[];
  status: string;
  assignee?: {
    email: string;
  };
  dueDate: string;
  priority: string;
}

interface UseTaskFiltersProps {
  tasks: Task[];
  currentUserEmail?: string;
}

export function useTaskFilters({ tasks, currentUserEmail }: UseTaskFiltersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "me" | null>(null);
  const [dueFilter, setDueFilter] = useState<"today" | "this_week" | "overdue" | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<"high" | "medium" | "low" | null>(null);

  // 모든 태그 추출
  const allTags = useMemo(() => 
    Array.from(new Set(tasks.flatMap(task => task.tags))).sort(),
    [tasks]
  );

  // 필터링된 태스크
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCompleted = showCompleted || task.status !== "completed";
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some((tag: string) => task.tags.includes(tag));
      
      const matchesAssignee = assigneeFilter === null || 
        assigneeFilter === "all" || 
        (assigneeFilter === "me" && currentUserEmail && task.assignee?.email === currentUserEmail);
      
      const matchesDue = dueFilter === null || (
        dueFilter === "today" && isToday(task.dueDate)
      ) || (
        dueFilter === "this_week" && isThisWeek(task.dueDate)
      ) || (
        dueFilter === "overdue" && new Date(task.dueDate) < new Date() && task.status !== "completed"
      );
      
      const matchesPriority = priorityFilter === null || task.priority === priorityFilter;
      
      return matchesSearch && matchesCompleted && matchesTags && 
             matchesAssignee && matchesDue && matchesPriority;
    });
  }, [tasks, searchTerm, showCompleted, selectedTags, assigneeFilter, dueFilter, priorityFilter]);

  // 필터 핸들러들
  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const clearAllQuickFilters = () => {
    setAssigneeFilter(null);
    setDueFilter(null);
    setPriorityFilter(null);
  };

  return {
    // 상태
    searchTerm,
    showCompleted,
    selectedTags,
    assigneeFilter,
    dueFilter,
    priorityFilter,
    allTags,
    filteredTasks,
    
    // 핸들러
    setSearchTerm,
    setShowCompleted,
    setAssigneeFilter,
    setDueFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
    clearAllQuickFilters,
  };
}
