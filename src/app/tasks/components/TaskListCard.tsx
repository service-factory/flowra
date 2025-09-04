"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, MessageSquare, MoreHorizontal, Paperclip, Target } from "lucide-react";
import React from "react";

interface Props {
  task: any;
  getTagColor: (tag: string) => string;
  onToggleTag: (tag: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
  onTaskClick: (task: any) => void;
}

export function TaskListCard({ task, getTagColor, onToggleTag, getStatusColor, getStatusText, getPriorityColor, getPriorityIcon, onTaskClick }: Props) {
  return (
    <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 cursor-pointer"
      onClick={() => onTaskClick(task)}>
      <div className="flex items-center space-x-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-gray-900 dark:text-white hover:text-blue-600 cursor-pointer truncate">{task.title}</h4>
            <Badge className={`${getStatusColor(task.status)} text-xs font-medium`}>{getStatusText(task.status)}</Badge>
            <div className={`${getPriorityColor(task.priority)}`}>{getPriorityIcon(task.priority)}</div>
            {task.storyPoints && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">{task.storyPoints}pt</span>
            )}
            {task.tags.slice(0, 2).map((tag: string, index: number) => (
              <span key={index} className={`px-2 py-1 text-xs rounded-full font-medium border cursor-pointer hover:scale-105 transition-transform ${getTagColor(tag)}`} onClick={() => onToggleTag(tag)}>{tag}</span>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{task.description}</p>
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"><Folder className="h-3 w-3" /><span className="font-medium">{task.epic}</span></span>
            <span className="flex items-center space-x-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-md"><Target className="h-3 w-3" /><span className="font-medium">{task.sprint}</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Avatar className="h-7 w-7">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-sm">{task.assignee.name[0]}</AvatarFallback>
          </Avatar>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{task.dueDate}</div>
            <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
              {task.comments > 0 && (<div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md"><MessageSquare className="h-3 w-3" /><span className="font-medium">{task.comments}</span></div>)}
              {task.attachments > 0 && (<div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md"><Paperclip className="h-3 w-3" /><span className="font-medium">{task.attachments}</span></div>)}
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}


