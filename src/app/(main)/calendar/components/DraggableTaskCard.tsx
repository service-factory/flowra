import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { CalendarTask } from '../types/calendar';
import { getPriorityIcon, getGoogleCalendarColor } from '../utils/calendarUtils';

interface DraggableTaskCardProps {
  task: CalendarTask;
  onTaskClick: (task: CalendarTask) => void;
  isCompact?: boolean;
}

export const DraggableTaskCard = memo(function DraggableTaskCard({ 
  task, 
  onTaskClick, 
  isCompact = false
}: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => onTaskClick(task)}
      className={`
        ${getGoogleCalendarColor(task.status)}
        ${isDragging ? 'opacity-50' : ''}
        ${isCompact ? 'p-1 text-xs' : 'p-2 text-sm'}
        rounded-r-md cursor-pointer hover:shadow-md transition-all duration-200
        border border-gray-200 dark:border-gray-600
        flex items-center justify-between group
      `}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <span className="text-xs">{getPriorityIcon(task.priority)}</span>
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-medium truncate`}>
            {task.title}
          </span>
        </div>
        {!isCompact && task.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
            {task.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center space-x-1 ml-2">
        <Badge 
          variant="secondary" 
          className={`${isCompact ? 'text-xs px-1 py-0' : 'text-xs px-2 py-1'} 
            ${task.status === 'completed' ? 'bg-green-100 text-green-800' : 
              task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
              'bg-gray-100 text-gray-800'}`}
        >
          {task.status === 'completed' ? '완료' : 
           task.status === 'in_progress' ? '진행중' : '대기'}
        </Badge>
      </div>
    </div>
  );
});
