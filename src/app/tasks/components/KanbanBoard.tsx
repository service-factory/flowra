"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCreateModal } from "@/components/task-create-modal";
import { TaskKanbanCard } from "./TaskKanbanCard";
import { Plus } from "lucide-react";

interface ColumnConfig {
  id: string;
  title: string;
}

interface Props {
  columns: ColumnConfig[];
  tasks: any[];
  getTagColor: (tag: string) => string;
  onToggleTag: (tag: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
  selectedTasks: string[];
  onToggleSelect: (taskId: string) => void;
  onTaskCreate: (newTask: any) => void;
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
  selectedTasks,
  onToggleSelect,
  onTaskCreate,
}: Props) {
  const grouped = columns.map((c) => ({
    ...c,
    tasks: tasks.filter((t) => t.status === c.id),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {grouped.map((column) => (
        <div key={column.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[600px]">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h3 className="font-medium text-gray-900 dark:text-white">{column.title}</h3>
                <Badge variant="secondary" className="text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {column.tasks.length}
                </Badge>
              </div>
              <TaskCreateModal
                trigger={<Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"><Plus className="h-4 w-4" /></Button>}
                onTaskCreate={onTaskCreate}
                initialStatus={column.id}
              />
            </div>
          </div>

          <div className="space-y-3">
            {column.tasks.map((task) => (
              <TaskKanbanCard
                key={task.id}
                task={task}
                selected={selectedTasks.includes(task.id)}
                onToggleSelect={() => onToggleSelect(task.id)}
                getTagColor={getTagColor}
                onToggleTag={onToggleTag}
                getStatusColor={getStatusColor}
                getStatusText={getStatusText}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}


