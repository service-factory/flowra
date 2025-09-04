"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

interface Props {
  tasks: any[];
  selectedTasks: string[];
  onToggleSelect: (taskId: string) => void;
  onToggleTag: (tag: string) => void;
  getTagColor: (tag: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
}

export function TaskTable({
  tasks,
  selectedTasks,
  onToggleSelect,
  onToggleTag,
  getTagColor,
  getStatusColor,
  getStatusText,
  getPriorityColor,
  getPriorityIcon,
}: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">업무</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">상태</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">담당자</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">마감일</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">우선순위</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedTasks.includes(task.id)}
                    onChange={() => onToggleSelect(task.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{task.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{task.description}</div>
                    {task.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {task.tags.slice(0, 2).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className={`px-2 py-1 text-xs rounded-full font-medium border cursor-pointer hover:scale-105 transition-transform ${getTagColor(tag)}`}
                            onClick={() => onToggleTag(tag)}
                          >
                            {tag}
                          </span>
                        ))}
                        {task.tags.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
                            +{task.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={`${getStatusColor(task.status)} text-xs font-medium`}>{getStatusText(task.status)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={task.assignee.avatar} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm">{task.assignee.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{task.assignee.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{task.dueDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center space-x-2">
                    <div className={`${getPriorityColor(task.priority)}`}>{getPriorityIcon(task.priority)}</div>
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>{task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


