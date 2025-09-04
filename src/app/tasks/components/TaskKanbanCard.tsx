"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MessageSquare, 
  MoreHorizontal, 
  Paperclip, 
  Clock, 
  User, 
  Flag,
  ChevronDown,
  ChevronUp
} from "lucide-react";
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

export function TaskKanbanCard({ 
  task, 
  getTagColor, 
  onToggleTag, 
  getStatusColor, 
  getStatusText, 
  getPriorityColor, 
  getPriorityIcon,
  onTaskClick
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "completed";
  const isDueToday = new Date(task.dueDate).toDateString() === new Date().toDateString();
  const isDueThisWeek = (() => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= today && dueDate <= weekFromNow;
  })();

  const getDueDateColor = () => {
    if (isOverdue) return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
    if (isDueToday) return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
    if (isDueThisWeek) return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30";
    return "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700";
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "오늘";
    if (diffDays === 1) return "내일";
    if (diffDays === -1) return "어제";
    if (diffDays > 0) return `${diffDays}일 후`;
    return `${Math.abs(diffDays)}일 전`;
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 mb-3 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
      onClick={() => onTaskClick(task)}
    >
      {/* 헤더 섹션 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-2 flex-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`inline-flex items-center justify-center ${getPriorityColor(task.priority)}`} title={`우선순위: ${getPriorityText(task.priority)}`}>
                <span className="[&>*]:h-3 [&>*]:w-3">
                  {getPriorityIcon(task.priority)}
                </span>
              </span>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm leading-5 line-clamp-2 mb-0">
                {task.title}
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>
      </div>


      {/* 태그 섹션 */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.tags.slice(0, isExpanded ? task.tags.length : 3).map((tag: string, index: number) => (
            <span 
              key={index} 
              className={`px-2 py-1 text-xs rounded-full font-medium border cursor-pointer hover:scale-105 transition-transform ${getTagColor(tag)}`}
              onClick={(e) => { e.stopPropagation(); onToggleTag(tag); }}
            >
              {tag}
            </span>
          ))}
          {!isExpanded && task.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300 font-medium border border-gray-200 dark:border-gray-600">
              +{task.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* 확장된 정보 */}
      {isExpanded && (
        <div className="mb-3 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <Flag className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">스토리 포인트:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{task.storyPoints}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3 text-gray-400" />
              <span className="text-gray-500 dark:text-gray-400">생성자:</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{task.creator.name}</span>
            </div>
          </div>
          {task.epic && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">에픽:</span>
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {task.epic}
              </Badge>
            </div>
          )}
          {task.sprint && (
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">스프린트:</span>
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {task.sprint}
              </Badge>
            </div>
          )}
        </div>
      )}

      {/* 하단 정보 바 */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {task.assignee.name[0]}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-700 dark:text-gray-300">{task.assignee.name}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {task.comments > 0 && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
              <MessageSquare className="h-3 w-3" />
              <span className="font-medium">{task.comments}</span>
            </div>
          )}
          {task.attachments > 0 && (
            <div className="flex items-center space-x-1 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">
              <Paperclip className="h-3 w-3" />
              <span className="font-medium">{task.attachments}</span>
            </div>
          )}
          <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-md ${getDueDateColor()}`}>
            <Calendar className="h-3 w-3" />
            <span className="font-medium">{formatDueDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getPriorityText(priority: string) {
  switch (priority) {
    case "high": return "높음";
    case "medium": return "보통";
    case "low": return "낮음";
    default: return priority;
  }
}


