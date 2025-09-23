"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProjectCreateModal } from "./project-create-modal";
import { useToastContext } from "./toast-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  User,
  Tag,
  Plus,
  X,
  Send,
  Building2,
  AlertCircle,
  Timer,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle
} from "lucide-react";

interface TaskCreateModalProps {
  trigger?: React.ReactNode;
  onTaskCreate?: (task: any) => void;
  initialStatus?: string;
  initialDueDate?: string;
  teamId?: string;
  projectId?: string;
  teamMembers?: any[];
  projects?: any[];
  isLoading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// 우선순위 옵션
const priorityOptions = [
  { value: "low", label: "낮음", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", icon: "🟢" },
  { value: "medium", label: "보통", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", icon: "🟡" },
  { value: "high", label: "높음", color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", icon: "🟠" },
  { value: "urgent", label: "긴급", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", icon: "🔴" }
];

// 상태 옵션
const statusOptions = [
  { value: "pending", label: "대기", color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200", icon: "⏳" },
  { value: "in_progress", label: "진행중", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: "🔄" },
  { value: "on_hold", label: "보류", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", icon: "⏸️" },
  { value: "completed", label: "완료", color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", icon: "✅" },
  { value: "cancelled", label: "취소", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", icon: "❌" }
];

// 기본 프로젝트 아이콘 매핑
const getProjectIcon = (projectName: string) => {
  const name = projectName.toLowerCase();
  if (name.includes('웹') || name.includes('web')) return "🌐";
  if (name.includes('모바일') || name.includes('mobile') || name.includes('앱')) return "📱";
  if (name.includes('api')) return "🔌";
  if (name.includes('데이터') || name.includes('database')) return "🗄️";
  if (name.includes('디자인') || name.includes('design')) return "🎨";
  if (name.includes('테스트') || name.includes('test')) return "🧪";
  return "📋";
};

const mockTeamTags = [
  { id: "1", name: "프론트엔드", color: "#3B82F6", usage_count: 15 },
  { id: "2", name: "백엔드", color: "#10B981", usage_count: 12 },
  { id: "3", name: "디자인", color: "#8B5CF6", usage_count: 8 },
  { id: "4", name: "테스트", color: "#F59E0B", usage_count: 6 },
  { id: "5", name: "문서화", color: "#6366F1", usage_count: 4 },
  { id: "6", name: "버그수정", color: "#EF4444", usage_count: 3 }
];

const TaskCreateModal = ({ 
  trigger, 
  onTaskCreate, 
  initialStatus,
  initialDueDate, 
  teamId,
  projectId,
  teamMembers = [],
  projects = [],
  isLoading: isDataLoading = false,
  open: controlledOpen,
  onOpenChange,
}: TaskCreateModalProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToastContext();
  
  // 기본 정보 (필수)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(initialStatus || "pending");
  const [priority, setPriority] = useState("medium");
  
  // 담당자 및 프로젝트 (선택)
  const [assigneeId, setAssigneeId] = useState<string>("none");
  const [projectIdState, setProjectIdState] = useState(projectId || "none");
  
  // 날짜 및 시간 (선택)
  const [dueDate, setDueDate] = useState(initialDueDate || "");
  const [estimatedHours, setEstimatedHours] = useState<number | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState<number>(() => {
    if (initialDueDate) return new Date(initialDueDate).getFullYear();
    return new Date().getFullYear();
  });
  const [pickerMonth, setPickerMonth] = useState<number>(() => {
    if (initialDueDate) return new Date(initialDueDate).getMonth();
    return new Date().getMonth();
  });
  
  // 태그 (선택)
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  // UI 상태
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // 세션에서 토큰 가져오기
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('세션 토큰이 없습니다');
      }

      // API 호출
      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team_id: teamId,
          project_id: projectIdState === "none" ? undefined : projectIdState || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          status,
          priority,
          assignee_id: assigneeId === "none" ? undefined : assigneeId || undefined,
          due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
          estimated_hours: estimatedHours || undefined,
          position: 0,
          metadata: {
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            dependencies: []
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '업무 생성에 실패했습니다');
      }

      const result = await response.json();
      
      // 부모 컴포넌트에 전달
      onTaskCreate?.(result.data);
      
      // 폼 리셋
      resetForm();
      
      // 모달 바로 닫기
      handleOpenChange(false);
      
      // Toast 메시지 표시
      toast({
        title: "업무 생성 완료",
        description: "업무가 성공적으로 생성되었습니다!",
        variant: "success"
      });
      
    } catch (error) {
      console.error('업무 생성 실패:', error);
      setErrors({ submit: error instanceof Error ? error.message : '업무 생성에 실패했습니다. 다시 시도해주세요.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus(initialStatus || "pending");
    setPriority("medium");
    setAssigneeId("none");
    setProjectIdState(projectId || "none");
    setDueDate(initialDueDate || "");
    setEstimatedHours(null);
    setSelectedTags([]);
    setNewTag("");
    setErrors({});
  };

  const addTag = (tag: string) => {
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (title.trim()) {
        handleSubmit(e);
      }
    }
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(new Date(year, month, -i));
    }
    days.reverse();
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    const total = Math.ceil(days.length / 7) * 7;
    for (let i = days.length; i < total; i++) {
      days.push(new Date(year, month + 1, i - days.length + 1));
    }
    return days;
  };

  const goPrevMonth = () => {
    const date = new Date(pickerYear, pickerMonth, 1);
    date.setMonth(date.getMonth() - 1);
    setPickerYear(date.getFullYear());
    setPickerMonth(date.getMonth());
  };

  const goNextMonth = () => {
    const date = new Date(pickerYear, pickerMonth, 1);
    date.setMonth(date.getMonth() + 1);
    setPickerYear(date.getFullYear());
    setPickerMonth(date.getMonth());
  };

  const isSameDay = (a: Date, b: Date) => {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const dialogOpen = controlledOpen ?? open;
  const handleOpenChange = (value: boolean) => {
    if (typeof controlledOpen === "boolean") {
      onOpenChange?.(value);
    } else {
      setOpen(value);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0">
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-semibold flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
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

            {/* 빠른 설정 - 2열 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 상태 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  상태
                </label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 우선순위 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  우선순위
                </label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 담당자와 프로젝트 - 2열 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 담당자 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  담당자
                </label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="담당자를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">담당자 없음</SelectItem>
                    {isDataLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                          <span>팀 멤버 로딩 중...</span>
                        </div>
                      </SelectItem>
                    ) : teamMembers.length === 0 ? (
                      <SelectItem value="no-members" disabled>
                        <span>팀 멤버가 없습니다</span>
                      </SelectItem>
                    ) : (
                      teamMembers.map((member) => {
                        const userId = member.user?.id;
                        const userName = member.user?.name;
                        const userEmail = member.user?.email;
                        const avatarUrl = member.user?.avatar_url;
                        
                        if (!userId) return null;
                        
                        return (
                          <SelectItem key={userId} value={userId}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="text-xs">
                                  {userName?.[0] || userEmail?.[0] || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span>{userName || userEmail || 'Unknown'}</span>
                              <Badge variant="outline" className="text-xs">{member.role}</Badge>
                            </div>
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 프로젝트 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  프로젝트
                </label>
                <div className="flex items-center space-x-2">
                  <Select value={projectIdState} onValueChange={setProjectIdState}>
                    <SelectTrigger>
                      <SelectValue placeholder="프로젝트를 선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">프로젝트 없음</SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: project.color || '#3B82F6' }}
                            />
                            <span>{getProjectIcon(project.name)}</span>
                            <span>{project.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ProjectCreateModal 
                    teamId={teamId}
                    onCreated={(project) => {
                      // 즉시 선택 (안전한 접근)
                      if (project?.id) {
                        setProjectIdState(project.id);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 마감일과 예상 시간 - 2열 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 마감일 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  마감일
                </label>
                <div className="relative inline-block">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="justify-start w-44"
                      onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                    >
                      {dueDate ? new Date(dueDate).toLocaleDateString() : "날짜 선택"}
                    </Button>
                    {dueDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setDueDate("")}
                      >
                        지우기
                      </Button>
                    )}
                  </div>
                  {isDatePickerOpen && (
                    <div className="absolute z-50 mt-2 w-72 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={goPrevMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium">
                          {pickerYear}년 {pickerMonth + 1}월
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={goNextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-7 text-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <div>일</div>
                        <div>월</div>
                        <div>화</div>
                        <div>수</div>
                        <div>목</div>
                        <div>금</div>
                        <div>토</div>
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(pickerYear, pickerMonth).map((date, idx) => {
                          const inCurrentMonth = date.getMonth() === pickerMonth;
                          const selected = dueDate && isSameDay(date, new Date(dueDate));
                          const isPast = formatDateKey(date) < new Date().toISOString().split('T')[0];
                          return (
                            <button
                              key={idx}
                              type="button"
                              disabled={isPast}
                              onClick={() => {
                                const key = formatDateKey(date);
                                setDueDate(key);
                                setIsDatePickerOpen(false);
                              }}
                              className={`h-8 w-8 rounded-md text-sm mx-auto flex items-center justify-center transition-colors
                                ${inCurrentMonth ? '' : 'text-gray-400 dark:text-gray-600'}
                                ${selected ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                                ${isPast ? 'opacity-50 cursor-not-allowed' : ''}
                              `}
                            >
                              {date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 예상 소요시간 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <Timer className="h-4 w-4 mr-1" />
                  예상 소요시간 (시간)
                </label>
                <Input
                  type="number"
                  placeholder="예: 8"
                  value={estimatedHours || ""}
                  onChange={(e) => setEstimatedHours(e.target.value ? parseFloat(e.target.value) : null)}
                  min="0"
                  step="0.5"
                />
              </div>
            </div>

            {/* 태그 - 간단한 태그 추가 */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                태그
              </label>
              
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedTags.map((tag) => (
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
                {mockTeamTags.slice(0, 6).map((tag) => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    onClick={() => addTag(tag.name)}
                    disabled={selectedTags.includes(tag.name)}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-2" 
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* 에러 메시지 */}
            {errors.submit && (
              <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}
            

            {/* 액션 버튼 */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-gray-500">
                Enter 키로 빠르게 생성할 수 있습니다
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={!title.trim() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
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