"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  Calendar, 
  MessageSquare, 
  Paperclip, 
  Edit3, 
  Save, 
  Trash2, 
  Clock,
  AlertTriangle,
  Circle,
  Square,
  Triangle,
  Plus,
} from "lucide-react";

interface Task {
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

interface TaskDetailDrawerProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  teamMembers: Array<{
    id: string;
    name: string;
    avatar: string;
    email: string;
  }>;
}

export function TaskDetailDrawer({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete, 
  teamMembers 
}: TaskDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [newTag, setNewTag] = useState("");
  const [showAddTag, setShowAddTag] = useState(false);

  useEffect(() => {
    console.log('TaskDetailDrawer - isOpen:', isOpen, 'task:', task);
    if (task) {
      setEditedTask({ ...task });
      setIsEditing(false);
    }
  }, [task, isOpen]);

  console.log('TaskDetailDrawer render - task:', task, 'isOpen:', isOpen, 'editedTask:', editedTask);
  
  // 임시로 항상 렌더링하도록 수정
  if (!task) {
    console.log('TaskDetailDrawer returning null - no task');
    return null;
  }
  
  // editedTask가 없으면 task로 초기화
  if (!editedTask) {
    setEditedTask({ ...task });
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50";
      case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50";
      case "pending": return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/30 dark:text-slate-300 dark:border-slate-800/50";
      case "overdue": return "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800/50";
      default: return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300 dark:border-gray-800/50";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "완료";
      case "in_progress": return "진행중";
      case "pending": return "대기";
      case "cancelled": return "취소";
      case "on_hold": return "보류";
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "text-red-600 dark:text-red-400";
      case "high": return "text-orange-600 dark:text-orange-400";
      case "medium": return "text-amber-600 dark:text-amber-400";
      case "low": return "text-emerald-600 dark:text-emerald-400";
      default: return "text-slate-500 dark:text-slate-400";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "urgent": return "긴급";
      case "high": return "높음";
      case "medium": return "보통";
      case "low": return "낮음";
      default: return priority;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent": return <AlertTriangle className="h-4 w-4 fill-current" />;
      case "high": return <Triangle className="h-4 w-4 fill-current" />;
      case "medium": return <Square className="h-4 w-4 fill-current" />;
      case "low": return <Circle className="h-4 w-4 fill-current" />;
      default: return <Circle className="h-4 w-4 fill-current" />;
    }
  };

  const getTagColor = (tag: string) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/50",
      "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/50",
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800/50",
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50",
      "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-800/50",
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800/50",
      "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800/50",
      "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800/50"
    ];
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isOverdue = new Date(editedTask.dueDate) < new Date() && editedTask.status !== "completed";
  const isDueToday = new Date(editedTask.dueDate).toDateString() === new Date().toDateString();

  const handleSave = () => {
    const updatedTask = {
      ...editedTask,
      updatedAt: new Date().toISOString().split('T')[0]
    };
    onUpdate(updatedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask({ ...task });
    setIsEditing(false);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTask.tags.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...editedTask.tags, newTag.trim()]
      });
      setNewTag("");
      setShowAddTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleDelete = () => {
    if (confirm('정말로 이 업무를 삭제하시겠습니까?')) {
      onDelete(task.id);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={`fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center justify-center ${getPriorityColor(editedTask.priority)}`}>
                  {getPriorityIcon(editedTask.priority)}
                </span>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? "업무 수정" : "업무 상세"}
                </h2>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    취소
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    삭제
                  </Button>
                </>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                제목
              </label>
              {isEditing ? (
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-semibold"
                />
              ) : (
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editedTask.title}
                </h1>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                설명
              </label>
              {isEditing ? (
                <Textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  className="resize-none"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {editedTask.description}
                </p>
              )}
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  상태
                </label>
                {isEditing ? (
                  <Select value={editedTask.status} onValueChange={(value) => setEditedTask({ ...editedTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">대기</SelectItem>
                      <SelectItem value="in_progress">진행중</SelectItem>
                      <SelectItem value="completed">완료</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={`${getStatusColor(editedTask.status)} font-medium`}>
                    {getStatusText(editedTask.status)}
                  </Badge>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  우선순위
                </label>
                {isEditing ? (
                  <Select value={editedTask.priority} onValueChange={(value) => setEditedTask({ ...editedTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">낮음</SelectItem>
                      <SelectItem value="medium">보통</SelectItem>
                      <SelectItem value="high">높음</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className={`${getPriorityColor(editedTask.priority)}`}>
                      {getPriorityIcon(editedTask.priority)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {getPriorityText(editedTask.priority)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                담당자
              </label>
              {isEditing ? (
                <Select value={editedTask.assignee.id} onValueChange={(value) => {
                  const newAssignee = teamMembers.find(member => member.id === value);
                  if (newAssignee) {
                    setEditedTask({ ...editedTask, assignee: newAssignee });
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{member.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={editedTask.assignee.avatar} />
                    <AvatarFallback>{editedTask.assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{editedTask.assignee.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{editedTask.assignee.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                마감일
              </label>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({ ...editedTask, dueDate: e.target.value })}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className={`h-4 w-4 ${isOverdue ? 'text-red-500' : isDueToday ? 'text-amber-500' : 'text-gray-400'}`} />
                  <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : isDueToday ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {formatDate(editedTask.dueDate)}
                  </span>
                  {isOverdue && (
                    <Badge variant="destructive" className="text-xs">
                      지연됨
                    </Badge>
                  )}
                  {isDueToday && (
                    <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-700">
                      오늘 마감
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                태그
              </label>
              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map((tag, index) => (
                  <Badge key={index} className={`${getTagColor(tag)} font-medium`}>
                    {tag}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {isEditing && (
                  <>
                    {showAddTag ? (
                      <div className="flex items-center space-x-1">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          placeholder="태그 입력"
                          className="h-6 text-xs w-20"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                          autoFocus
                        />
                        <Button size="sm" variant="ghost" onClick={handleAddTag} className="h-6 w-6 p-0">
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowAddTag(false)} className="h-6 w-6 p-0">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddTag(true)}
                        className="h-6 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        태그 추가
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  스토리 포인트
                </label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={editedTask.storyPoints}
                    onChange={(e) => setEditedTask({ ...editedTask, storyPoints: parseInt(e.target.value) || 0 })}
                    className="w-20"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {editedTask.storyPoints}pt
                  </span>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  생성자
                </label>
                <div className="flex items-center space-x-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={editedTask.creator.avatar} />
                    <AvatarFallback className="text-xs">{editedTask.creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{editedTask.creator.name}</span>
                </div>
              </div>
            </div>

            {/* Epic and Sprint */}
            {(editedTask.epic || editedTask.sprint) && (
              <div className="grid grid-cols-2 gap-4">
                {editedTask.epic && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      에픽
                    </label>
                    <Badge variant="outline">{editedTask.epic}</Badge>
                  </div>
                )}
                {editedTask.sprint && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      스프린트
                    </label>
                    <Badge variant="outline">{editedTask.sprint}</Badge>
                  </div>
                )}
              </div>
            )}

            {/* Activity */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">활동</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <MessageSquare className="h-4 w-4" />
                  <span>댓글 {editedTask.comments}개</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Paperclip className="h-4 w-4" />
                  <span>첨부파일 {editedTask.attachments}개</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>생성일: {formatDate(editedTask.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Edit3 className="h-4 w-4" />
                  <span>수정일: {formatDate(editedTask.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
