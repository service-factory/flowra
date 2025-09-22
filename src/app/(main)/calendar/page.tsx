"use client";

import { TeamGuard } from "@/components/team-guard";
import { TeamCreateModal } from "@/components/team-create-modal";
import TaskCreateModal from "@/components/task-create-modal";
import { TaskDetailDrawer } from "../tasks/components/TaskDetailDrawer";
import { CalendarHeader } from "./components/CalendarHeader";
import { CalendarView } from "./components/CalendarView";
import { useCalendarData } from "./hooks/useCalendarData";

export default function CalendarPage() {
  const {
    currentDate,
    viewMode,
    setViewMode,
    teamMembers,
    tasksByDate,
    selectedTask,
    isDrawerOpen,
    isTaskCreateOpen,
    taskCreateInitials,
    isTeamCreateModalOpen,
    isInitialLoading,
    isRefreshing,
    taskCreateModalProps,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    openTaskCreateModal,
    handleTaskMove,
    navigateDate,
    goToToday,
    setIsTaskCreateOpen,
    setIsTeamCreateModalOpen,
    refreshTeamData,
    currentTeam
  } = useCalendarData();

  return (
    <TeamGuard>
      <div className="h-[calc(100vh-2rem)] flex flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onNavigate={navigateDate}
          onGoToToday={goToToday}
          openTaskCreateModal={openTaskCreateModal}
          isLoading={isInitialLoading}
        />
        
        <div className="flex-1 overflow-hidden">
          <CalendarView
            currentDate={currentDate}
            viewMode={viewMode}
            tasksByDate={tasksByDate}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            openTaskCreateModal={openTaskCreateModal}
            isLoading={isInitialLoading}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      <TaskCreateModal 
        {...taskCreateModalProps}
        onTaskCreate={handleTaskCreate}
        key="task-create-modal-in-calendar-page"
        open={isTaskCreateOpen}
        onOpenChange={setIsTaskCreateOpen}
        initialStatus={taskCreateInitials.initialStatus}
        initialDueDate={taskCreateInitials.initialDueDate}
      />

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
