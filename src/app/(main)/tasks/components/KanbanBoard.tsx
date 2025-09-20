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
  CollisionDetection,
  pointerWithin,
  rectIntersection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { Plus } from "lucide-react";

interface ColumnConfig {
  id: string;
  title: string;
  color: string;
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
  onTaskMove?: (taskId: string, newStatus: string, newIndex?: number) => void;
  onTaskClick: (task: Task) => void;
  openTaskCreateModal: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskStatusUpdate?: (taskId: string, status: string) => Promise<void>;
  teamId?: string;
}

// 드래그 가능한 칸반 카드 컴포넌트
function DraggableTaskCard({ 
  task, 
  onTaskClick,
  onTaskDelete,
  onTaskStatusUpdate,
  teamId
}: {
  task: Task;
  onTaskClick: (task: Task) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskStatusUpdate?: (taskId: string, status: string) => Promise<void>;
  teamId?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="opacity-30 bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-20"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing"
    >
      <TaskKanbanCard
        task={task}
        onTaskClick={onTaskClick}
        onTaskDelete={onTaskDelete}
        onTaskStatusUpdate={onTaskStatusUpdate}
        teamId={teamId}
      />
    </div>
  );
}

// 드롭 가능한 칼럼 컴포넌트
function DroppableColumn({ 
  column, 
  tasks, 
  onTaskClick,
  openTaskCreateModal,
  onTaskDelete,
  onTaskStatusUpdate,
  teamId
}: {
  column: ColumnConfig;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  openTaskCreateModal: (opts?: { initialStatus?: string; initialDueDate?: string }) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskStatusUpdate?: (taskId: string, status: string) => Promise<void>;
  teamId?: string;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  return (
    <div className="flex flex-col">
      {/* 칼럼 헤더 */}
      <div className="mb-3 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                column.id === 'pending' 
                  ? 'bg-slate-400'
                  : column.id === 'in_progress'
                  ? 'bg-blue-500'
                  : 'bg-emerald-500'
              }`} />
              <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                {column.title}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors opacity-60 hover:opacity-100"
            onClick={() => openTaskCreateModal({ initialStatus: column.id })}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 드롭 존 */}
      <div 
        ref={setNodeRef}
        className={`flex-1 min-h-[600px] p-3 rounded-lg border-2 border-dashed transition-all duration-300 ${
          isOver 
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/20 shadow-lg' 
            : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50'
        }`}
      >
        <SortableContext items={tasks.map((t: Task) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors ${
                    isOver 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-500' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className={`text-sm transition-colors ${
                    isOver 
                      ? 'text-blue-600 dark:text-blue-400 font-medium' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {isOver ? '여기에 드롭하세요' : '업무를 추가하세요'}
                  </p>
                </div>
              </div>
            ) : (
              tasks.map((task: Task) => (
                <DraggableTaskCard
                  key={task.id}
                  task={task}
                  onTaskClick={onTaskClick}
                  onTaskDelete={onTaskDelete}
                  onTaskStatusUpdate={onTaskStatusUpdate}
                  teamId={teamId}
                />
              ))
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({
  columns,
  tasks,
  onTaskMove,
  onTaskClick,
  openTaskCreateModal,
  onTaskDelete,
  onTaskStatusUpdate,
  teamId,
}: Props) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 커스텀 충돌 감지 알고리즘 - 50% 겹치면 드롭 가능
  const customCollisionDetection: CollisionDetection = (args) => {
    const { droppableRects, collisionRect } = args;

    // 먼저 pointerWithin으로 포인터가 있는 컨테이너 찾기
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // 포인터 기반 감지가 실패하면 사각형 교집합으로 폴백
    const intersectionCollisions = rectIntersection(args);
    
    if (intersectionCollisions.length > 0) {
      // 50% 이상 겹치는 컨테이너만 필터링
      const filteredCollisions = intersectionCollisions.filter((collision) => {
        const droppableRect = droppableRects.get(collision.id);
        if (!droppableRect || !collisionRect) return false;

        // 교집합 영역 계산
        const intersectionArea = Math.max(0, 
          Math.min(collisionRect.right, droppableRect.right) - 
          Math.max(collisionRect.left, droppableRect.left)
        ) * Math.max(0, 
          Math.min(collisionRect.bottom, droppableRect.bottom) - 
          Math.max(collisionRect.top, droppableRect.top)
        );

        // 드래그 중인 요소의 면적
        const draggedArea = collisionRect.width * collisionRect.height;

        // 50% 이상 겹치는지 확인
        const overlapPercentage = intersectionArea / draggedArea;

        return overlapPercentage >= 0.5; // 50% 이상 겹치면 드롭 가능
      });

      if (filteredCollisions.length > 0) {
        return filteredCollisions;
      }
    }

    // 최후 수단으로 closestCorners 사용
    return closestCorners(args);
  };

  // 3가지 상태만 필터링
  const allowedStatuses = ['pending', 'in_progress', 'completed'];
  const filteredColumns = columns.filter(c => allowedStatuses.includes(c.id));
  
  const grouped = filteredColumns.map((c) => ({
    ...c,
    tasks: tasks.filter((t) => t.status === c.id),
  }));

  // 모든 태스크 ID를 하나의 SortableContext에 포함
  const allTaskIds = tasks.map(task => task.id);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (active.data.current?.type === "task") {
      const task = active.data.current.task as Task;
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    let newStatus: string;

    // over 타겟이 칼럼인지 태스크인지 확인
    if (over.data.current?.type === "column") {
      newStatus = over.id as string;
    } else {
      // 태스크 위에 드롭된 경우, 해당 태스크의 상태를 사용
      const targetTask = tasks.find(t => t.id === over.id);
      if (!targetTask) return;
      newStatus = targetTask.status;
    }

    // 허용된 상태인지 확인
    if (!allowedStatuses.includes(newStatus)) {
      return;
    }

    // 같은 칼럼 내에서의 이동인지 확인
    const currentTask = tasks.find((t) => t.id === taskId);
    if (currentTask && currentTask.status === newStatus) {
      return;
    }

    // 상태 업데이트 API 호출
    if (onTaskStatusUpdate) {
      onTaskStatusUpdate(taskId, newStatus);
    } else if (onTaskMove) {
      onTaskMove(taskId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={allTaskIds} strategy={verticalListSortingStrategy}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {grouped.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={column.tasks}
              onTaskClick={onTaskClick}
              openTaskCreateModal={openTaskCreateModal}
              onTaskDelete={onTaskDelete}
              onTaskStatusUpdate={onTaskStatusUpdate}
              teamId={teamId}
            />
          ))}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeTask ? (
          <div className="rotate-3 scale-110 opacity-95 shadow-2xl ring-4 ring-blue-300 dark:ring-blue-600 rounded-lg border-2 border-blue-400 dark:border-blue-500 bg-white dark:bg-gray-800 p-1">
            <TaskKanbanCard
              task={activeTask}
              onTaskClick={() => {}}
              onTaskDelete={onTaskDelete}
              onTaskStatusUpdate={onTaskStatusUpdate}
              teamId={teamId}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}


