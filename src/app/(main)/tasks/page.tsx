"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTeamData } from "@/hooks/useTeamData";
import { useTaskFilters } from "@/hooks/useTaskFilters";
import { useViewMode } from "@/hooks/useViewMode";
import { useTaskHandlers } from "@/hooks/useTaskHandlers";
import { useTaskActions } from "@/hooks/useTaskActions";
import { TaskStatus, Task } from '@/types';
import TaskCreateModal from "@/components/task-create-modal";
import { TeamCreateModal } from "@/components/team-create-modal";
import { TeamGuard } from "@/components/team-guard";
import { useAuth } from "@/hooks/useAuth";
import { TasksToolbar } from "./components/TasksToolbar";
import { TagFilterPanel } from "./components/TagFilterPanel";
import { TaskDetailDrawer } from "./components/TaskDetailDrawer";
import { TaskViewRenderer } from "./components/TaskViewRenderer";
import { ViewModeSelector } from "./components/ViewModeSelector";
import { getTagColor } from "@/lib/utils/taskUtils";

export default function TasksPage() {
  const [showTagFilter] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  const [taskCreateInitials, setTaskCreateInitials] = useState<{ initialStatus?: string; initialDueDate?: string }>({});

  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  
  const { currentTeam, refreshTeamData, user } = useAuth();
  
  const actualTeamId = useMemo(() => {
    if (teamId === '0' || !teamId) {
      return currentTeam?.id || null;
    }
    return teamId;
  }, [teamId, currentTeam?.id]);

  const { 
    data: teamData, 
    isLoading, 
    refetch 
  } = useTeamData(actualTeamId);
  
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([]);
  const tasks = useMemo(() => {
    const serverTasks = teamData?.tasks || [];
    return optimisticTasks.length > 0 ? optimisticTasks : serverTasks;
  }, [teamData?.tasks, optimisticTasks]);
  
  const teamMembers = useMemo(() => teamData?.members || [], [teamData?.members]);
  const projects = useMemo(() => teamData?.projects || [], [teamData?.projects]);

  const taskCreateModalProps = useMemo(() => {
    const props = {
      teamId: actualTeamId || undefined,
      teamMembers,
      projects,
      isLoading
    };
    return props;
  }, [actualTeamId, teamMembers, projects, isLoading]);

  const {
    searchTerm,
    showCompleted,
    selectedTags,
    assigneeFilter,
    dueFilter,
    priorityFilter,
    allTags,
    filteredTasks,
    setSearchTerm,
    setShowCompleted,
    setAssigneeFilter,
    setDueFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
    clearAllQuickFilters,
  } = useTaskFilters({ 
    tasks, 
    currentUserEmail: user?.email 
  });

  const { viewMode, setViewMode } = useViewMode();

  // Task Actions with Optimistic UI
  const { optimisticDeleteTask, updateTaskStatus } = useTaskActions(
    actualTeamId || undefined,
    {
      optimisticUpdate: (newTasks) => setOptimisticTasks(newTasks),
      revert: () => setOptimisticTasks([])
    }
  );

  const {
    selectedTask,
    isDrawerOpen,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    handleRefresh,
  } = useTaskHandlers({ refetch, tasks });

  // Enhanced handlers with optimistic UI
  const handleOptimisticTaskMove = async (taskId: string, newStatus: string) => {
    try {
      const serverTasks = teamData?.tasks || [];
      await updateTaskStatus(taskId, newStatus as TaskStatus, serverTasks);
      // Refetch to ensure consistency
      setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error('❌ Task move failed:', error);
    }
  };

  const handleOptimisticTaskDelete = async (taskId: string) => {
    try {
      const serverTasks = teamData?.tasks || [];
      await optimisticDeleteTask(taskId, serverTasks);
      // Refetch to ensure consistency
      setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error('Task delete failed:', error);
    }
  };

  const handleOptimisticStatusUpdate = async (taskId: string, status: string) => {
    try {
      const serverTasks = teamData?.tasks || [];
      await updateTaskStatus(taskId, status as TaskStatus, serverTasks);
      // Refetch to ensure consistency
      setTimeout(() => refetch(), 100);
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };


  const openTaskCreateModal = (opts?: { initialStatus?: string; initialDueDate?: string }) => {
    setTaskCreateInitials({ initialStatus: opts?.initialStatus, initialDueDate: opts?.initialDueDate });
    setIsTaskCreateOpen(true);
  };

  return (
    <TeamGuard>
      <div>
        {/* TaskCreateModal은 유지하되 버튼은 헤더로 이동 */}
        <TaskCreateModal 
          {...taskCreateModalProps}
          onTaskCreate={handleTaskCreate}
          key="task-create-modal-in-tasks-page"
          open={isTaskCreateOpen}
          onOpenChange={setIsTaskCreateOpen}
          initialStatus={taskCreateInitials.initialStatus}
          initialDueDate={taskCreateInitials.initialDueDate}
        />

        {/* 검색 및 필터 툴바 */}
        <div className="mb-4">
          <TasksToolbar
            searchTerm={searchTerm}
            onChangeSearch={setSearchTerm}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted(!showCompleted)}
            isRefreshing={isLoading}
            onRefresh={handleRefresh}
            assigneeFilter={assigneeFilter}
            setAssigneeFilter={setAssigneeFilter}
            dueFilter={dueFilter}
            setDueFilter={setDueFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            onClearQuickFilters={clearAllQuickFilters}
            teamMembers={teamMembers}
            onCreateTask={() => setIsTaskCreateOpen(true)}
            isLoading={isLoading}
          />

          {/* 태그 필터 패널 */}
          {showTagFilter && (
            <TagFilterPanel
              allTags={allTags}
              selectedTags={selectedTags}
              onToggle={handleTagToggle}
              onClear={clearTagFilters}
              getTagColor={getTagColor}
            />
          )}
        </div>

        {/* 뷰 모드 선택기 */}
        <ViewModeSelector
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredTasksCount={filteredTasks.length}
          selectedTagsCount={selectedTags.length}
        />

        {/* 뷰 렌더러 */}
        <TaskViewRenderer
          viewMode={viewMode}
          filteredTasks={filteredTasks}
          isLoading={isLoading}
          teamId={actualTeamId || undefined}
          currentTeam={currentTeam}
          onTaskMove={handleOptimisticTaskMove}
          onTaskClick={handleTaskClick}
          openTaskCreateModal={openTaskCreateModal}
          onTaskDelete={handleOptimisticTaskDelete}
          onTaskStatusUpdate={handleOptimisticStatusUpdate}
        />
      </div>

      {/* Task 상세 Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        onUpdate={handleTaskUpdate}
        onDelete={handleTaskDelete}
        teamMembers={[]}
      />

      {/* Team Create Modal */}
      <TeamCreateModal 
        isOpen={isTeamCreateModalOpen} 
        onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async () => {
          await refreshTeamData();
          if (currentTeam) {
            window.location.href = `/tasks?teamId=${currentTeam.id}`;
          } else {
            window.location.href = '/tasks?teamId=0';
          }
        }}
      />
    </TeamGuard>
  );
}