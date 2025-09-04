"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Flag,
  User,
  Tag,
  Plus,
  X,
  Zap,
  Send,
  CheckCircle
} from "lucide-react";

interface TaskCreateModalProps {
  trigger?: React.ReactNode;
  onTaskCreate?: (task: any) => void;
  initialStatus?: string; // 칸반 컬럼에서 사용할 초기 상태
  initialDueDate?: string; // 캘린더에서 특정 날짜에 Task 생성 시 사용
}

const mockTeamMembers = [
  { id: "1", name: "김디자인", avatar: "/avatars/kim.jpg", email: "kim@example.com" },
  { id: "2", name: "이PM", avatar: "/avatars/pm.jpg", email: "pm@example.com" },
  { id: "3", name: "이개발", avatar: "/avatars/lee.jpg", email: "lee@example.com" },
  { id: "4", name: "박백엔드", avatar: "/avatars/park.jpg", email: "park@example.com" },
  { id: "5", name: "최테스트", avatar: "/avatars/choi.jpg", email: "choi@example.com" }
];

const priorityOptions = [
  { value: "low", label: "낮음", color: "text-green-500", icon: "🟢" },
  { value: "medium", label: "보통", color: "text-yellow-500", icon: "🟡" },
  { value: "high", label: "높음", color: "text-red-500", icon: "🔴" }
];

const commonTags = ["디자인", "개발", "백엔드", "프론트엔드", "테스트", "기획", "문서화", "버그수정"];

export function TaskCreateModal({ trigger, onTaskCreate, initialStatus, initialDueDate }: TaskCreateModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState<any>(null);
  const [dueDate, setDueDate] = useState(initialDueDate || "");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 빠른 할 일 추가를 위한 상태
  const [quickMode, setQuickMode] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    
    // 실제로는 API 호출
    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      status: initialStatus || "pending",
      priority,
      assignee: assignee || mockTeamMembers[0],
      dueDate: dueDate || initialDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      tags,
      comments: 0,
      attachments: 0
    };

    // 부모 컴포넌트에 전달
    onTaskCreate?.(newTask);
    
    // 폼 리셋
    setTitle("");
    setDescription("");
    setAssignee(null);
    setDueDate(initialDueDate || "");
    setPriority("medium");
    setTags([]);
    setNewTag("");
    setOpen(false);
    setIsLoading(false);
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        handleSubmit(e);
      }
    }
  };

  const defaultTrigger = (
    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
      <Plus className="h-4 w-4 mr-2" />
      새 업무
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <Zap className="h-5 w-5 mr-2 text-blue-600" />
              새 업무 추가
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 - 가장 중요한 필드 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                업무 제목 *
              </label>
              <Input
                placeholder="업무 제목을 입력하세요..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyPress={handleKeyPress}
                className="text-lg font-medium"
                autoFocus
                required
              />
            </div>

            {/* 설명 - 선택사항 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                설명
              </label>
              <Textarea
                placeholder="업무에 대한 자세한 설명을 입력하세요... (선택사항)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* 빠른 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 담당자 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  담당자
                </label>
                <div className="flex items-center space-x-2">
                  {assignee ? (
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee.avatar} />
                        <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{assignee.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={() => setAssignee(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {mockTeamMembers.slice(0, 3).map((member) => (
                        <Button
                          key={member.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => setAssignee(member)}
                        >
                          <Avatar className="h-4 w-4 mr-1">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback className="text-xs">{member.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{member.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 우선순위 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Flag className="h-4 w-4 mr-1" />
                  우선순위
                </label>
                <div className="flex space-x-2">
                  {priorityOptions.map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={priority === option.value ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setPriority(option.value)}
                    >
                      <span className="mr-1">{option.icon}</span>
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* 마감일 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                마감일
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="max-w-xs"
              />
            </div>

            {/* 태그 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                태그
              </label>
              
              {/* 선택된 태그들 */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* 태그 추가 */}
              <div className="flex space-x-2">
                <Input
                  placeholder="태그 추가..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(newTag);
                      setNewTag("");
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addTag(newTag);
                    setNewTag("");
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* 자주 사용하는 태그 */}
              <div className="flex flex-wrap gap-1">
                {commonTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => addTag(tag)}
                    disabled={tags.includes(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Enter 키로 빠르게 생성할 수 있습니다
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      생성 중...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      업무 생성
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TaskCreateModal;
