import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import TaskCreateModal from "@/components/task-create-modal";
import { TaskCard } from "@/components/TaskCard";
import { Task, TeamData } from "../types/dashboard";
import { TaskCardSkeleton } from "./LoadingSkeleton";

interface RecentTasksProps {
  filteredTasks: Task[];
  teamData?: TeamData;
  isLoading: boolean;
  currentTeamId?: string;
  isTaskCreateOpen: boolean;
  onTaskCreateOpenChange: (open: boolean) => void;
}

export const RecentTasks = ({ 
  filteredTasks, 
  teamData, 
  isLoading, 
  currentTeamId,
  isTaskCreateOpen,
  onTaskCreateOpenChange
}: RecentTasksProps) => {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">최근 업무</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
          <TaskCreateModal 
            teamId={currentTeamId}
            teamMembers={teamData?.members || []}
            projects={teamData?.projects || []}
            isLoading={isLoading}
            onTaskCreate={() => {}}
            open={isTaskCreateOpen}
            onOpenChange={onTaskCreateOpenChange}
            key="task-create-modal-in-dashboard" 
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <TaskCardSkeleton key={i} />
          ))
        ) : (
          filteredTasks.map((task) => {
            const assignee = teamData?.members?.find(member => member.id === task.assignee_id);
            
            return (
              <TaskCard 
                key={task.id} 
                task={task} 
                assignee={assignee}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
