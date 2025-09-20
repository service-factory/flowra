"use client";

import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTeamData } from "@/hooks/useTeamData";
import { useTaskHandlers } from "@/hooks/useTaskHandlers";
import { useAuth } from "@/hooks/useAuth";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarView } from "./components/CalendarView";
import TaskCreateModal from "@/components/task-create-modal";
import { TaskDetailDrawer } from "../tasks/components/TaskDetailDrawer";
import { TeamGuard } from "@/components/team-guard";
import { TeamCreateModal } from "@/components/team-create-modal";
import { Task } from "@/types";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [taskCreateInitials, setTaskCreateInitials] = useState<{ initialStatus?: string; initialDueDate?: string }>({});
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const teamId = searchParams.get('teamId');
  
  const { currentTeam, refreshTeamData } = useAuth();
  
  const actualTeamId = useMemo(() => {
    if (teamId === '0' || !teamId) {
      return currentTeam?.id || null;
    }
    return teamId;
  }, [teamId, currentTeam?.id]);

  // URL에서 뷰 모드 관리
  const viewMode = (searchParams.get('view') as "month" | "week" | "day") || 'month';
  
  const setViewMode = (mode: "month" | "week" | "day") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', mode);
    router.push(`?${params.toString()}`);
  };

  const { 
    data: teamData, 
    isLoading, 
    refetch 
  } = useTeamData(actualTeamId);
  
  const tasks = useMemo(() => teamData?.tasks || [], [teamData?.tasks]);
  const teamMembers = useMemo(() => teamData?.members || [], [teamData?.members]);
  const projects = useMemo(() => teamData?.projects || [], [teamData?.projects]);

  const {
    selectedTask,
    isDrawerOpen,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
  } = useTaskHandlers({ refetch, tasks });


  // 날짜별로 태스크 그룹화
  const tasksByDate = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return "🚨";
      case "high": return "🔺";
      case "medium": return "🔸";
      case "low": return "🔹";
      default: return "🔹";
    }
  };

  const taskCreateModalProps = useMemo(() => {
    const props = {
      teamId: actualTeamId || undefined,
      teamMembers,
      projects,
      isLoading
    };
    return props;
  }, [actualTeamId, teamMembers, projects, isLoading]);


  const openTaskCreateModal = (opts?: { initialStatus?: string; initialDueDate?: string }) => {
    setTaskCreateInitials({ initialStatus: opts?.initialStatus, initialDueDate: opts?.initialDueDate });
    setIsTaskCreateOpen(true);
  };

  const handleTaskMove = (taskId: string, newDueDate: string) => {
    // TODO: API 호출로 task 업데이트
    console.log('Task move:', { taskId, newDueDate });
    refetch();
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
    <TeamGuard>
      <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        {/* 캘린더 헤더 */}
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNavigate={navigateDate}
          onGoToToday={goToToday}
          onTaskCreate={handleTaskCreate}
          openTaskCreateModal={openTaskCreateModal}
        />
        {/* 캘린더 뷰 */}
        <div className="flex-1 overflow-hidden">
          <CalendarView
            currentDate={currentDate}
            viewMode={viewMode}
            tasksByDate={tasksByDate}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            getStatusText={getStatusText}
            getPriorityIcon={getPriorityIcon}
            openTaskCreateModal={openTaskCreateModal}
          />
        </div>
      </div>

      {/* TaskCreateModal */}
      <TaskCreateModal 
        {...taskCreateModalProps}
        onTaskCreate={handleTaskCreate}
        key="task-create-modal-in-calendar-page"
        open={isTaskCreateOpen}
        onOpenChange={setIsTaskCreateOpen}
        initialStatus={taskCreateInitials.initialStatus}
        initialDueDate={taskCreateInitials.initialDueDate}
      />

      {/* Task 상세 Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        teamMembers={teamMembers.map(member => ({
          id: member.id,
          name: member.name,
          avatar_url: member.avatar_url,
          email: member.email
        }))}
      />

      {/* Team Create Modal */}
      <TeamCreateModal 
        isOpen={isTeamCreateModalOpen} 
        onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async () => {
          await refreshTeamData();
          if (currentTeam) {
            window.location.href = `/calendar?teamId=${currentTeam.id}`;
          } else {
            window.location.href = '/calendar?teamId=0';
          }
        }}
      />
    </TeamGuard>
  );
}
