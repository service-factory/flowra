"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { MoreHorizontal, Trash2, RefreshCw, Link } from "lucide-react";
import React from "react";
import { TaskStatus } from "@/types";

interface TaskData {
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
  task: TaskData;
  onTaskClick: (task: TaskData) => void;
  onTaskDelete?: (taskId: string) => Promise<void>;
  onTaskStatusUpdate?: (taskId: string, status: TaskStatus) => Promise<void>;
  teamId?: string;
}

export function TaskKanbanCard({ 
  task, 
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
      // TODO: 토스트 알림 추가
    } catch (error) {
      console.error('링크 복사 실패:', error);
    }
  };


  return (
    <>
      {ConfirmDialogComponent}
      <div 
        className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
      onClick={(e) => {
        // 드롭다운 메뉴가 클릭된 경우 이벤트 전파 중단
        if ((e.target as HTMLElement).closest('[role="menuitem"]') || 
            (e.target as HTMLElement).closest('button')) {
          return;
        }
        onTaskClick(task);
      }}
    >
      {/* 더보기 버튼 - 호버 시에만 표시 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100 dark:hover:bg-gray-800"
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

      {/* Task 제목 */}
      <div className="pr-8 mb-8">
        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-relaxed line-clamp-3">
          {task.title}
        </h4>
      </div>

      {/* 하단 정보 */}
      <div className="flex items-center justify-between">
        {/* 좌측 - 프로젝트 번호 */}
        <div className="flex items-center">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {getProjectNumber(task.id)}
            </span>
          </div>
        </div>

        {/* 우측 - 사용자 프로필 */}
        <div className="flex items-center">
          {task.assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} />
              <AvatarFallback className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {task.assignee.name?.[0] || task.assignee.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <span className="text-xs text-gray-400">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}


