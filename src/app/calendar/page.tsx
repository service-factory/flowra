"use client";

import { useState, useMemo } from "react";

import { HeaderBar } from "@/components/header-bar";
import { TaskCreateModal } from "@/components/task-create-modal";
import { CalendarView } from "./components/CalendarView";
import { TaskDetailDrawer } from "../tasks/components/TaskDetailDrawer";
import { mockTasksWithDetails, mockUsers } from "@/data/mockData";
import { TaskWithDetails } from "@/types/database";
import { adaptTaskForDrawer, adaptTaskFromDrawer } from "@/utils/taskAdapter";

export default function CalendarPage() {
  const [tasks, setTasks] = useState<TaskWithDetails[]>(mockTasksWithDetails);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedTask, setSelectedTask] = useState<TaskWithDetails | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 날짜별로 태스크 그룹화
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: TaskWithDetails[] } = {};
    
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = task.due_date.split('T')[0]; // YYYY-MM-DD 형식으로 변환
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  // 필터링된 태스크 (현재는 사용하지 않음 - tasksByDate에서 필터링)
  // const filteredTasks = useMemo(() => {
  //   return tasks.filter(task => {
  //     const matchesAssignee = assigneeFilter === null || assigneeFilter === "all" || 
  //       (assigneeFilter === "me" && task.assignee?.email === "dev.lee@flowra.com");
  //     const matchesPriority = priorityFilter === null || task.priority === priorityFilter;
  //     return matchesAssignee && matchesPriority;
  //   });
  // }, [tasks, assigneeFilter, priorityFilter]);

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50";
  //     case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50";
  //     case "pending": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800/50";
  //     case "overdue": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50";
  //     default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50";
  //   }
  // };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "완료";
      case "in_progress": return "진행중";
      case "pending": return "대기";
      case "cancelled": return "취소";
      case "on_hold": return "보류";
      default: return status;
    }
  };

  // const getPriorityColor = (priority: string) => {
  //   switch (priority) {
  //     case "urgent": return "text-red-600 dark:text-red-400";
  //     case "high": return "text-orange-600 dark:text-orange-400";
  //     case "medium": return "text-amber-600 dark:text-amber-400";
  //     case "low": return "text-emerald-600 dark:text-emerald-400";
  //     default: return "text-slate-500 dark:text-slate-400";
  //   }
  // };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return "🚨";
      case "high": return "🔺";
      case "medium": return "🔸";
      case "low": return "🔹";
      default: return "🔹";
    }
  };

  const handleTaskCreate = (newTask: TaskWithDetails) => {
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskMove = (taskId: string, newDueDate: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, due_date: newDueDate, updated_at: new Date().toISOString() }
        : task
    ));
  };

  const handleTaskClick = (task: TaskWithDetails) => {
    console.log('Task clicked:', task);
    setSelectedTask(task);
    setIsDrawerOpen(true);
    console.log('Drawer should be open:', true);
  };

  const handleTaskUpdate = (updatedTask: TaskWithDetails) => {
    const adaptedTask = adaptTaskFromDrawer(updatedTask);
    setTasks(prev => prev.map(task => 
      task.id === adaptedTask.id ? adaptedTask : task
    ));
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedTask(null);
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case "month":
        newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
        break;
      case "week":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
        break;
      case "day":
        newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <HeaderBar
        title="Calendar"
        subtitle="일정 관리"
        showCalendarControls={true}
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigate={navigateDate}
        onGoToToday={goToToday}
        rightActions={(
          <div className="flex items-center space-x-2">
            <TaskCreateModal onTaskCreate={handleTaskCreate} />
          </div>
        )}
      />

      <div className="flex-1 px-4 py-4 mx-auto w-full overflow-hidden">
        {/* 캘린더 뷰 */}
        <CalendarView
          currentDate={currentDate}
          viewMode={viewMode}
          tasksByDate={tasksByDate}
          onTaskClick={handleTaskClick}
          onTaskCreate={handleTaskCreate}
          onTaskMove={handleTaskMove}
          getStatusText={getStatusText}
          getPriorityIcon={getPriorityIcon}
        />
      </div>

      {/* Task 상세 Drawer */}
      <TaskDetailDrawer
        task={selectedTask ? adaptTaskForDrawer(selectedTask) : null}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onUpdate={(updatedTask: TaskWithDetails) => handleTaskUpdate(updatedTask)}
        onDelete={handleTaskDelete}
        teamMembers={mockUsers.map(user => ({
          id: user.id,
          name: user.name,
          avatar: user.avatar_url || "/avatars/default.jpg",
          email: user.email
        }))}
      />
    </div>
  );
}
