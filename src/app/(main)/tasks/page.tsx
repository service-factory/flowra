"use client";

import TeamGuard from "@/components/team-guard";
import TeamCreateModal from "@/components/team-create-modal";
import TaskCreateModal from "@/components/task-create-modal";
import { TasksToolbar } from "./components/TasksToolbar";
import { TagFilterPanel } from "./components/TagFilterPanel";
import TaskDetailDrawer from "./components/TaskDetailDrawer";
import { TaskViewRenderer } from "./components/TaskViewRenderer";
import { ViewModeSelector } from "./components/ViewModeSelector";
import { getTagColor } from "@/lib/utils/taskUtils";
import { useTasksData } from "./hooks/useTasksData";

export default function TasksPage() {
  const {
    showTagFilter,
    isTeamCreateModalOpen,
    isTaskCreateOpen,
    taskCreateInitials,
    actualTeamId,
    currentTeam,
    teamMembers,
    filteredTasks,
    allTags,
    viewMode,
    selectedTask,
    isDrawerOpen,
    isInitialLoading,
    isRefreshing,
    taskCreateModalProps,
    searchTerm,
    showCompleted,
    selectedTags,
    assigneeFilter,
    dueFilter,
    priorityFilter,
    setSearchTerm,
    setShowCompleted,
    setAssigneeFilter,
    setDueFilter,
    setPriorityFilter,
    handleTagToggle,
    clearTagFilters,
    clearAllQuickFilters,
    setViewMode,
    handleTaskCreate,
    handleTaskClick,
    handleTaskUpdate,
    handleTaskDelete,
    handleDrawerClose,
    handleRefresh,
    handleOptimisticTaskMove,
    handleOptimisticTaskDelete,
    handleOptimisticStatusUpdate,
    openTaskCreateModal,
    setIsTaskCreateOpen,
    setIsTeamCreateModalOpen,
    refreshTeamData
  } = useTasksData();

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

        <div className="mb-4">
          <TasksToolbar
            searchTerm={searchTerm}
            onChangeSearch={setSearchTerm}
            showCompleted={showCompleted}
            onToggleCompleted={() => setShowCompleted(!showCompleted)}
            isRefreshing={isRefreshing}
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
            isLoading={isInitialLoading}
          />

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

        <ViewModeSelector
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredTasksCount={filteredTasks.length}
          selectedTagsCount={selectedTags.length}
          isLoading={isInitialLoading}
        />

        <TaskViewRenderer
          viewMode={viewMode}
          filteredTasks={filteredTasks}
          isLoading={isInitialLoading}
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