"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Edit3, 
  Trash2, 
  AlertTriangle,
  Circle,
  Square,
  Triangle,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Task, TaskTag, TaskStatus, TaskPriority } from "@/types";

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    email: string;
  }>;
}

const TaskDetailDrawer = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete, 
  teamMembers 
}: TaskDetailDrawerProps) => {
  const { confirm, ConfirmDialogComponent } = useConfirmDialog();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  useEffect(() => {
    if (task) {
      // tags 배열이 없으면 빈 배열로 초기화
      const taskWithTags = {
        ...task,
        tags: task.tags || []
      };
      setEditedTask(taskWithTags);
      setIsEditing(false);
    }
  }, [task, isOpen]);

  if (!task || !editedTask) {
    return null;
  }
  

  // 상태 관련 헬퍼 함수들
  const getStatusConfig = (status: string) => {
    const configs = {
      completed: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50",
        text: "완료",
        icon: "✓"
      },
      in_progress: {
        color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50",
        text: "진행중",
        icon: "⏳"
      },
      pending: {
        color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800/50",
        text: "대기",
        icon: "⏸"
      },
      cancelled: {
        color: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50",
        text: "취소",
        icon: "✕"
      },
      on_hold: {
        color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
        text: "보류",
        icon: "⏸"
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getPriorityConfig = (priority: string) => {
    const configs = {
      urgent: {
        color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20",
        text: "긴급",
        icon: <AlertTriangle className="h-4 w-4 fill-current" />
      },
      high: {
        color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20",
        text: "높음",
        icon: <Triangle className="h-4 w-4 fill-current" />
      },
      medium: {
        color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20",
        text: "보통",
        icon: <Square className="h-4 w-4 fill-current" />
      },
      low: {
        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20",
        text: "낮음",
        icon: <Circle className="h-4 w-4 fill-current" />
      }
    };
    return configs[priority as keyof typeof configs] || configs.medium;
  };


  // 날짜 포맷팅 함수 개선
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '날짜 없음';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '유효하지 않은 날짜';
      
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '유효하지 않은 날짜';
    }
  };

  const getDateInputValue = (dateStr?: string | null) => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  // 날짜 상태 확인
  const dueDateStatus = (() => {
    if (!editedTask.due_date) return null;
    
    try {
      const dueDate = new Date(editedTask.due_date);
      const today = new Date();
      const todayStr = today.toDateString();
      
      if (isNaN(dueDate.getTime())) return null;
      
      const isOverdue = dueDate < today && editedTask.status !== "completed";
      const isDueToday = dueDate.toDateString() === todayStr;
      
      return { isOverdue, isDueToday, dueDate };
    } catch {
      return null;
    }
  })();

  // 이벤트 핸들러들
  const handleSave = () => {
    const updatedTask = {
      ...editedTask,
      updated_at: new Date().toISOString()
    };
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (task) {
      const taskWithTags = {
        ...task,
        tags: task.tags || []
      };
      setEditedTask(taskWithTags);
    }
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      const existingTags = editedTask.tags || [];
      const tagExists = existingTags.some(tag => 
        (typeof tag === 'string' ? tag : tag.tag) === newTag.trim()
      );
      
      if (!tagExists) {
        const newTagObject: TaskTag = {
          id: `temp-${Date.now()}`,
          task_id: editedTask.id,
          tag: newTag.trim(),
          color: '#3B82F6',
          created_at: new Date().toISOString()
        };
        
      setEditedTask({
        ...editedTask,
          tags: [...existingTags, newTagObject]
      });
      }
      
      setNewTag("");
      setShowAddTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: TaskTag | string) => {
    const tagName = typeof tagToRemove === 'string' ? tagToRemove : tagToRemove.tag;
    const existingTags = editedTask.tags || [];
    
    setEditedTask({
      ...editedTask,
      tags: existingTags.filter(tag => 
        (typeof tag === 'string' ? tag : tag.tag) !== tagName
      )
    });
  };

  const handleDelete = () => {
    confirm({
      title: "업무 삭제",
      description: "정말로 이 업무를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      confirmText: "삭제",
      cancelText: "취소",
      variant: "destructive",
      onConfirm: () => {
        onDelete(task.id);
        onClose();
      }
    });
  };

  // 담당자 변경 핸들러
  const handleAssigneeChange = (userId: string) => {
    const newAssignee = teamMembers.find(member => member.id === userId);
    if (newAssignee) {
      setEditedTask({ 
        ...editedTask, 
        assignee_id: userId,
        assignee: {
          id: newAssignee.id,
          name: newAssignee.name,
          email: newAssignee.email,
          avatar_url: newAssignee.avatar_url,
          provider: 'unknown',
          provider_id: '',
          discord_id: undefined,
          timezone: 'Asia/Seoul',
          email_verified: true,
          is_active: true,
          created_at: '',
          updated_at: ''
        }
      });
    }
  };

  const statusConfig = getStatusConfig(editedTask.status);
  const priorityConfig = getPriorityConfig(editedTask.priority);

  return (
    <>
      {ConfirmDialogComponent}
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-3xl bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Simple Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 mr-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {editedTask.id.slice(-6)}
                    </Badge>
                    <Badge className={`${statusConfig.color} text-xs`}>
                      {statusConfig.text}
                    </Badge>
                    <div className={`flex items-center space-x-1 text-xs ${priorityConfig.color.replace('bg-', 'text-').split(' ')[0]}`}>
                      {priorityConfig.icon}
                      <span>{priorityConfig.text}</span>
              </div>
            </div>
                  
                  {isEditing ? (
                    <Input
                      value={editedTask.title}
                      onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                      className="text-lg font-semibold border-0 p-0 h-auto focus-visible:ring-0"
                      placeholder="업무 제목을 입력하세요"
                    />
                  ) : (
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                      {editedTask.title}
                    </h1>
                  )}
                </div>
                
                <div className="flex items-center space-x-1">
              {isEditing ? (
                <>
                      <Button variant="ghost" size="sm" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    저장
                  </Button>
                </>
              ) : (
                <>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit3 className="h-4 w-4" />
                  </Button>
                      <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
            </div>
            </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-6">
            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">설명</label>
              {isEditing ? (
                <Textarea
                    value={editedTask.description || ''}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                    rows={3}
                    className="w-full"
                    placeholder="업무에 대한 설명을 입력하세요..."
                />
              ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-md p-3 min-h-[60px]">
                    {editedTask.description || '설명이 없습니다.'}
                  </div>
              )}
            </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">상태</label>
                {isEditing ? (
                    <Select value={editedTask.status} onValueChange={(value) => setEditedTask({ ...editedTask, status: value as TaskStatus })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">대기</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                        <SelectItem value="cancelled">취소</SelectItem>
                        <SelectItem value="on_hold">보류</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {statusConfig.text}
                    </div>
                )}
              </div>
                
                {/* Priority */}
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">우선순위</label>
                {isEditing ? (
                    <Select value={editedTask.priority} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as TaskPriority })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                        <SelectItem value="urgent">긴급</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {priorityConfig.text}
                  </div>
                )}
            </div>

            {/* Assignee */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">담당자</label>
              {isEditing ? (
                    <Select 
                      value={editedTask.assignee_id || ''} 
                      onValueChange={handleAssigneeChange}
                    >
                  <SelectTrigger>
                        <SelectValue placeholder="담당자 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                            {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                    <div className="flex items-center space-x-2">
                      {editedTask.assignee ? (
                        <>
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={editedTask.assignee.avatar_url} />
                            <AvatarFallback className="text-xs">{editedTask.assignee.name[0]}</AvatarFallback>
                  </Avatar>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{editedTask.assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">미할당</span>
                      )}
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">마감일</label>
              {isEditing ? (
                <Input
                  type="date"
                      value={getDateInputValue(editedTask.due_date)}
                      onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                />
              ) : (
                    <div className={`text-sm font-medium ${
                      dueDateStatus?.isOverdue ? 'text-red-600 dark:text-red-400' : 
                      dueDateStatus?.isDueToday ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatDate(editedTask.due_date)}
                      {dueDateStatus?.isOverdue && <span className="ml-2 text-xs text-red-600">(지연)</span>}
                      {dueDateStatus?.isDueToday && <span className="ml-2 text-xs text-amber-600">(오늘)</span>}
                    </div>
                  )}
                </div>
            </div>

            {/* Tags */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">태그</label>
              <div className="flex flex-wrap gap-2">
                  {editedTask.tags?.map((tag, index) => {
                    const tagName = typeof tag === 'string' ? tag : tag.tag;
                    return (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tagName}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-600 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                    );
                  })}
                  
                {isEditing && (
                  <>
                    {showAddTag ? (
                      <div className="flex items-center space-x-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                            placeholder="태그 이름"
                            className="h-7 text-xs w-20"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          autoFocus
                        />
                          <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-7 w-7 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
                          <Button size="sm" variant="ghost" onClick={() => setShowAddTag(false)} className="h-7 w-7 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddTag(true)}
                          className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                          추가
                      </Button>
                    )}
                  </>
                )}
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <div>생성일: {formatDate(editedTask.created_at)}</div>
                <div>수정일: {formatDate(editedTask.updated_at)}</div>
                {editedTask.creator && (
                  <div className="flex items-center space-x-1">
                    <span>생성자:</span>
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={editedTask.creator.avatar_url} />
                    <AvatarFallback className="text-xs">{editedTask.creator.name[0]}</AvatarFallback>
                  </Avatar>
                    <span>{editedTask.creator.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TaskDetailDrawer;
