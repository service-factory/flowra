"use client";

import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCreateModal } from "@/components/task-create-modal";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { Plus, GripVertical } from "lucide-react";

interface ColumnConfig {
  id: string;
  title: string;
  color: string;
  headerColor: string;
  count: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  creator: {
    id: string;
    name: string;
    avatar: string;
  };
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  tags: string[];
  comments: number;
  attachments: number;
  storyPoints: number;
  epic: string;
  sprint: string;
  labels: string[];
}

interface Props {
  columns: ColumnConfig[];
  tasks: Task[];
  getTagColor: (tag: string) => string;
  onToggleTag: (tag: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
  onTaskCreate: (newTask: Task) => void;
  onTaskMove?: (taskId: string, newStatus: string, newIndex?: number) => void;
  onTaskClick: (task: Task) => void;
}

// 드래그 가능한 칸반 카드 컴포넌트
function DraggableTaskCard({ 
  task, 
  getTagColor, 
  onToggleTag, 
  getStatusColor, 
  getStatusText, 
  getPriorityColor, 
  getPriorityIcon,
  onTaskClick
}: {
  task: Task;
  getTagColor: (tag: string) => string;
  onToggleTag: (tag: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
  onTaskClick: (task: Task) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50 z-50' : ''} relative group`}
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <div {...attributes} {...listeners} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
      </div>
      <TaskKanbanCard
        task={task}
        getTagColor={getTagColor}
        onToggleTag={onToggleTag}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
        getPriorityColor={getPriorityColor}
        getPriorityIcon={getPriorityIcon}
        onTaskClick={onTaskClick}
      />
    </div>
  );
}

// 드롭 가능한 칼럼 컴포넌트
function DroppableColumn({ 
  column, 
  tasks, 
  getTagColor, 
  onToggleTag, 
  getStatusColor, 
  getStatusText, 
  getPriorityColor, 
  getPriorityIcon, 
  onTaskCreate,
  onTaskClick
}: {
  column: ColumnConfig;
  tasks: Task[];
  getTagColor: (tag: string) => string;
  onToggleTag: (tag: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
  onTaskCreate: (newTask: Task) => void;
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[600px] flex flex-col">
      {/* 칼럼 헤더 */}
      <div className={`${column.headerColor} rounded-md p-3 mb-4 border border-gray-200/50 dark:border-gray-700/50`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{column.title}</h3>
            <Badge variant="secondary" className="text-xs font-medium bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-0">
              {tasks.length}
            </Badge>
          </div>
          <TaskCreateModal
            trigger={
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-md transition-colors"
              >
                <Plus className="h-4 w-4" />
              </Button>
            }
            onTaskCreate={onTaskCreate}
            initialStatus={column.id}
          />
        </div>
      </div>

      {/* 드롭 존 */}
      <SortableContext items={tasks.map((t: Task) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3 min-h-0">
          {tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">업무를 추가하세요</p>
              </div>
            </div>
          ) : (
            tasks.map((task: Task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                getTagColor={getTagColor}
                onToggleTag={onToggleTag}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                onTaskClick={onTaskClick}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export function KanbanBoard({
  columns,
  tasks,
  getTagColor,
  onToggleTag,
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityIcon,
  onTaskCreate,
  onTaskMove,
  onTaskClick,
}: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const grouped = columns.map((c) => ({
    ...c,
    tasks: tasks.filter((t) => t.status === c.id),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !onTaskMove) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // 같은 칼럼 내에서의 이동인지 확인
    const currentTask = tasks.find((t) => t.id === taskId);
    if (currentTask && currentTask.status === newStatus) return;

    onTaskMove(taskId, newStatus);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {grouped.map((column) => (
          <DroppableColumn
            key={column.id}
            column={column}
            tasks={column.tasks}
            getTagColor={getTagColor}
            onToggleTag={onToggleTag}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getPriorityColor={getPriorityColor}
            getPriorityIcon={getPriorityIcon}
            onTaskCreate={onTaskCreate}
            onTaskClick={onTaskClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-105 opacity-90">
            <TaskKanbanCard
              task={activeTask}
              getTagColor={getTagColor}
              onToggleTag={onToggleTag}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
              getPriorityColor={getPriorityColor}
              getPriorityIcon={getPriorityIcon}
              onTaskClick={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}


