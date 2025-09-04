"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, MoreHorizontal, Paperclip } from "lucide-react";
import React from "react";

interface Props {
  task: any;
  selected: boolean;
  onToggleSelect: () => void;
  getTagColor: (tag: string) => string;
  onToggleTag: (tag: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
}

export function TaskKanbanCard({ task, selected, onToggleSelect, getTagColor, onToggleTag, getStatusColor, getStatusText, getPriorityColor, getPriorityIcon }: Props) {
  return (
    <div className={`group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-3 cursor-pointer hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 ${selected ? 'ring-2 ring-blue-500/50 border-blue-300 bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
      onClick={onToggleSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2 flex-1">
          <input type="checkbox" checked={selected} onChange={(e) => { e.stopPropagation(); onToggleSelect(); }} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`inline-flex items-center justify-center ${getPriorityColor(task.priority)}`} title={`Priority: ${task.priority}`}>
                <span className="[&>*]:h-3 [&>*]:w-3">
                  {getPriorityIcon(task.priority)}
                </span>
              </span>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-5 line-clamp-2 mb-0">{task.title}</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{task.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, 3).map((tag: string, index: number) => (
            <span key={index} className={`px-2 py-1 text-xs rounded-full font-medium border cursor-pointer hover:scale-105 transition-transform ${getTagColor(tag)}`}
              onClick={(e) => { e.stopPropagation(); onToggleTag(tag); }}>
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-700 dark:text-gray-300">{task.assignee.name}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {task.comments > 0 && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md"><MessageSquare className="h-3 w-3" /><span className="font-medium">{task.comments}</span></div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md"><Paperclip className="h-3 w-3" /><span className="font-medium">{task.attachments}</span></div>
          )}
          <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md"><Calendar className="h-3 w-3" /><span className="font-medium">{task.dueDate}</span></div>
        </div>
      </div>
    </div>
  );
}


