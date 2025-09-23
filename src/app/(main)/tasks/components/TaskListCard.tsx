"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { MoreHorizontal, Trash2, RefreshCw, Link, ChevronRight, MessageSquare, Paperclip } from "lucide-react";
import React from "react";
import { TaskStatus } from "@/types";

interface TaskData {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  storyPoints?: number;
  tags: string[];
  epic?: string;
  sprint?: string;
  assignee: {
    name: string;
    avatar?: string;
  };
  dueDate?: string;
  comments?: number;
  attachments?: number;
}

interface Props {
  task: TaskData;
  getTagColor: (tag: string) => string;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  getPriorityColor: (p: string) => string;
  getPriorityIcon: (p: string) => React.ReactNode;
  onTaskClick: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskStatusUpdate?: (taskId: string, status: TaskStatus) => Promise<void>;
  teamId?: string;
}

export function TaskListCard({ 
  task, 
  getTagColor, 
  getStatusColor, 
  getStatusText, 
  getPriorityColor, 
  getPriorityIcon, 
  onTaskClick,
  onTaskDelete,
  onTaskStatusUpdate,
  teamId
}: Props) {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();

  // 프로젝트 번호 추출 (ID의 마지막 6자리 사용)
  const getProjectNumber = (id: string) => {
    return id.slice(-6).toUpperCase();
  };

  // 상태 변경 핸들러 - API 호출만 수행
  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (onTaskStatusUpdate && teamId) {
      try {
        await onTaskStatusUpdate(task.id, newStatus);
      } catch (error) {
        console.error('상태 변경 실패:', error);
      }
    }
  };

  // 업무 삭제 핸들러
  const handleDelete = async () => {
    if (onTaskDelete && teamId) {
      confirm({
        title: "업무 삭제",
        description: "정말로 이 업무를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
        confirmText: "삭제",
        cancelText: "취소",
        variant: "destructive",
        onConfirm: async () => {
          try {
            await onTaskDelete(task.id);
          } catch (error) {
            console.error('업무 삭제 실패:', error);
          }
        }
      });
    }
  };

  // 링크 복사 핸들러
  const handleCopyLink = async () => {
    try {
      const taskUrl = `${window.location.origin}/tasks?id=${task.id}`;
      await navigator.clipboard.writeText(taskUrl);
    } catch (error) {
      console.error('링크 복사 실패:', error);
    }
  };

  return (
    <>
      {ConfirmDialogComponent}
      <div 
        className="group relative bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
      onClick={(e) => {
        // 드롭다운 메뉴가 클릭된 경우 이벤트 전파 중단
        if ((e.target as HTMLElement).closest('[role="menuitem"]') || 
            (e.target as HTMLElement).closest('button')) {
          return;
        }
        onTaskClick(task);
      }}
    >
      <div className="px-4 py-3">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* 체크박스 + 키 */}
          <div className="col-span-1 flex items-center space-x-2">
            <input 
              type="checkbox" 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-mono hover:underline">
              {getProjectNumber(task.id)}
            </span>
          </div>

          {/* 우선순위 아이콘 */}
          <div className="col-span-1 flex justify-center">
            <div className={`${getPriorityColor(task.priority)} flex items-center justify-center`}>
              {getPriorityIcon(task.priority)}
            </div>
          </div>

          {/* 제목 */}
          <div className="col-span-4 min-w-0">
            <div className="flex items-center space-x-2">
              <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate hover:text-blue-600 dark:hover:text-blue-400">
                {task.title}
              </h4>
            </div>
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 ml-5">
                {task.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className={`text-xs px-1.5 py-0.5 ${getTagColor(tag)}`}
                  >
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                    +{task.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* 상태 */}
          <div className="col-span-2">
            <Badge className={`${getStatusColor(task.status)} text-xs font-medium`}>
              {getStatusText(task.status)}
            </Badge>
          </div>

          {/* 담당자 */}
          <div className="col-span-2 flex items-center space-x-2">
            {task.assignee ? (
              <>
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    {task.assignee.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                  {task.assignee.name}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">미할당</span>
            )}
          </div>

          {/* 기한 정보 + 액션 */}
          <div className="col-span-2 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* 기한 */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {task.dueDate ? (
                  <span className={`${new Date(task.dueDate) < new Date() ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {new Date(task.dueDate).toLocaleDateString('ko-KR', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
              
              {/* 추가 정보 아이콘들 */}
              <div className="flex items-center space-x-2 text-gray-400">
                {task.comments && task.comments > 0 && (
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-xs">{task.comments}</span>
                  </div>
                )}
                {task.attachments && task.attachments > 0 && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-3 w-3" />
                    <span className="text-xs">{task.attachments}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 더보기 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>업무 관리</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* 상태 변경 */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    상태 변경
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStatusChange('pending');
                    }}>
                      <div className="w-2 h-2 bg-gray-500 rounded-full mr-2" />
                      대기
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStatusChange('in_progress');
                    }}>
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      진행중
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStatusChange('completed');
                    }}>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      완료
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 링크 복사 */}
                <DropdownMenuItem onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyLink();
                }}>
                  <Link className="mr-2 h-4 w-4" />
                  링크 복사
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* 삭제 */}
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  제거
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}


