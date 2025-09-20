"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Building2,
  Hash,
  FileText,
  AlertCircle,
  CheckCircle,
  Globe,
  Bell,
  Shield,
  Palette,
  ArrowRight,
  Info,
  MessageSquare,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

interface TeamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (teamData: TeamCreateData) => void;
}

interface TeamCreateData {
  name: string;
  description?: string;
  slug: string;
  timezone: string;
  language: string;
  visibility: 'private' | 'public';
  color: string;
  icon?: string;
  notificationSettings: {
    email: boolean;
    push: boolean;
    discord: boolean;
  };
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
}

const TEAM_COLORS = [
  { name: "파란색", value: "blue", class: "bg-blue-500" },
  { name: "초록색", value: "green", class: "bg-green-500" },
  { name: "보라색", value: "purple", class: "bg-purple-500" },
  { name: "주황색", value: "orange", class: "bg-orange-500" },
  { name: "핑크색", value: "pink", class: "bg-pink-500" },
  { name: "인디고", value: "indigo", class: "bg-indigo-500" },
  { name: "빨간색", value: "red", class: "bg-red-500" },
  { name: "청록색", value: "cyan", class: "bg-cyan-500" },
];

const TEAM_ICONS = [
  { name: "Building2", icon: Building2, label: "건물" },
  { name: "Users", icon: Users, label: "사람들" },
  { name: "Shield", icon: Shield, label: "방패" },
  { name: "Globe", icon: Globe, label: "지구" },
  { name: "MessageSquare", icon: MessageSquare, label: "메시지" },
];

const TIMEZONES = [
  "Asia/Seoul",
  "Asia/Tokyo", 
  "Asia/Shanghai",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Australia/Sydney",
];

const LANGUAGES = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "ja", name: "日本語" },
  { code: "zh", name: "中文" },
];


export function TeamCreateModal({ isOpen, onClose, onCreate }: TeamCreateModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [timezone, setTimezone] = useState("Asia/Seoul");
  const [language, setLanguage] = useState("ko");
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [color, setColor] = useState("blue");
  const [selectedIcon, setSelectedIcon] = useState("Building2");
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    discord: false,
  });
  const [workingHours, setWorkingHours] = useState({
    start: "09:00",
    end: "18:00",
    timezone: "Asia/Seoul",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 슬러그 자동 생성
  const generateSlug = (teamName: string) => {
    return teamName
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s]/g, '')
      .replace(/[가-힣]/g, (char) => {
        const hangulMap: Record<string, string> = {
          '가': 'ga', '나': 'na', '다': 'da', '라': 'ra', '마': 'ma',
          '바': 'ba', '사': 'sa', '아': 'a', '자': 'ja', '차': 'cha',
          '카': 'ka', '타': 'ta', '파': 'pa', '하': 'ha',
          '팀': 'team', '그룹': 'group', '조직': 'org', '회사': 'company'
        };
        return hangulMap[char] || char;
      })
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (value && !slug) {
      setSlug(generateSlug(value));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) {
        newErrors.name = "팀 이름을 입력해주세요";
      } else if (name.length < 2) {
        newErrors.name = "팀 이름은 2자 이상이어야 합니다";
      } else if (name.length > 50) {
        newErrors.name = "팀 이름은 50자 이하여야 합니다";
      }

      if (!slug.trim()) {
        newErrors.slug = "팀 URL을 입력해주세요";
      } else if (!/^[a-z0-9-]+$/.test(slug)) {
        newErrors.slug = "팀 URL은 영문 소문자, 숫자, 하이픈만 사용 가능합니다";
      } else if (slug.length < 3) {
        newErrors.slug = "팀 URL은 3자 이상이어야 합니다";
      } else if (slug.length > 30) {
        newErrors.slug = "팀 URL은 30자 이하여야 합니다";
      }

      if (description && description.length > 200) {
        newErrors.description = "팀 설명은 200자 이하여야 합니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => prev - 1);
  };


  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const teamData: TeamCreateData = {
        name: name.trim(),
        description: description.trim() || undefined,
        slug: slug.trim(),
        timezone,
        language,
        visibility,
        color,
        icon: selectedIcon,
        notificationSettings,
        workingHours,
      };

      // Supabase 클라이언트에서 세션 가져오기
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('로그인이 필요합니다');
      }

      // API 호출 (Authorization 헤더로 토큰 전달)
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(teamData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '팀 생성에 실패했습니다');
      }

      // 성공 시 콜백 호출
      await onCreate(teamData);
      
      // 성공 메시지 표시
      setErrors({ success: '팀이 성공적으로 생성되었습니다! 대시보드로 이동합니다...' });
      
      // 폼 초기화
      setCurrentStep(1);
      setName("");
      setDescription("");
      setSlug("");
      setTimezone("Asia/Seoul");
      setLanguage("ko");
      setVisibility('private');
      setColor("blue");
      setSelectedIcon("Building2");
      setNotificationSettings({ email: true, push: true, discord: false });
      setWorkingHours({ start: "09:00", end: "18:00", timezone: "Asia/Seoul" });
      setShowAdvanced(false);
      
      // 잠시 후 모달 닫기
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error("팀 생성 실패:", error);
      setErrors({ submit: error instanceof Error ? error.message : '팀 생성에 실패했습니다' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setName("");
    setDescription("");
    setSlug("");
    setTimezone("Asia/Seoul");
    setLanguage("ko");
    setVisibility('private');
    setColor("blue");
    setSelectedIcon("Building2");
    setNotificationSettings({ email: true, push: true, discord: false });
    setWorkingHours({ start: "09:00", end: "18:00", timezone: "Asia/Seoul" });
    setErrors({});
    setShowAdvanced(false);
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                팀 기본 정보
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                팀의 이름과 설명을 입력해주세요
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name" className="text-sm font-medium">팀 이름 *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="team-name"
                    placeholder="예: 개발팀, 마케팅팀, 사이드프로젝트"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className={`pl-10 ${errors.name ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-slug" className="text-sm font-medium">팀 URL *</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      flowra.app/team/
                    </span>
                    <Input
                      id="team-slug"
                      placeholder="team-url"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className={`rounded-l-none pl-10 ${errors.slug ? "border-red-300 focus:border-red-500" : ""}`}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                {errors.slug && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.slug}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  팀 URL은 나중에 변경할 수 없습니다. 영문 소문자, 숫자, 하이픈만 사용 가능합니다.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team-description" className="text-sm font-medium">팀 설명 (선택사항)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="team-description"
                    placeholder="팀에 대한 간단한 설명을 작성해주세요..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className={`pl-10 ${errors.description ? "border-red-300 focus:border-red-500" : ""}`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {description.length}/200자
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                팀 브랜딩
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                팀의 색상과 아이콘을 선택해주세요
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">팀 색상</Label>
                <div className="grid grid-cols-4 gap-3">
                  {TEAM_COLORS.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => setColor(colorOption.value)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        color === colorOption.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full ${colorOption.class} mx-auto mb-2`} />
                      <p className="text-xs text-gray-600 dark:text-gray-400">{colorOption.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">팀 아이콘</Label>
                <div className="grid grid-cols-4 gap-3">
                  {TEAM_ICONS.map((iconOption) => {
                    const IconComponent = iconOption.icon;
                    return (
                      <button
                        key={iconOption.name}
                        onClick={() => setSelectedIcon(iconOption.name)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedIcon === iconOption.name
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <IconComponent className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600 dark:text-gray-400">{iconOption.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${TEAM_COLORS.find(c => c.value === color)?.class} flex items-center justify-center`}>
                    {React.createElement(TEAM_ICONS.find(i => i.name === selectedIcon)?.icon || Building2, { className: "w-5 h-5 text-white" })}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{name || "팀 이름"}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">flowra.app/team/{slug || "team-url"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Settings className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                팀 설정
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                팀의 기본 설정을 구성해주세요
              </p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">시간대</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">언어</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">팀 공개 설정</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={visibility === 'private'}
                      onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                      className="text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <EyeOff className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">비공개</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">초대받은 멤버만 접근 가능</p>
                      </div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={visibility === 'public'}
                      onChange={(e) => setVisibility(e.target.value as 'private' | 'public')}
                      className="text-blue-600"
                    />
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">공개</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">누구나 팀 정보를 볼 수 있음</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Settings className="w-4 h-4" />
                  <span>고급 설정 {showAdvanced ? '숨기기' : '보기'}</span>
                </button>
              </div>

              {showAdvanced && (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">알림 설정</Label>
                    <div className="space-y-2">
                      {[
                        { key: 'email', label: '이메일 알림', icon: MessageSquare },
                        { key: 'push', label: '푸시 알림', icon: Bell },
                        { key: 'discord', label: '디스코드 연동', icon: MessageSquare },
                      ].map(({ key, label, icon: Icon }) => (
                        <label key={key} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={notificationSettings[key as keyof typeof notificationSettings]}
                            onChange={(e) => setNotificationSettings(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="text-blue-600"
                          />
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">근무 시간</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-gray-500">시작 시간</Label>
                        <Input
                          type="time"
                          value={workingHours.start}
                          onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">종료 시간</Label>
                        <Input
                          type="time"
                          value={workingHours.end}
                          onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );


      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            <span>새 팀 만들기</span>
          </DialogTitle>
          <DialogDescription>
            단계별로 팀을 설정하고 멤버들을 초대해보세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-8 h-0.5 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderStepContent()}
          
          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{errors.submit}</p>
              </div>
            </div>
          )}
          
          {errors.success && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">{errors.success}</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between pt-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Info className="h-4 w-4" />
            <span>언제든지 설정을 변경할 수 있습니다</span>
          </div>
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrev} disabled={isSubmitting}>
                이전
              </Button>
            )}
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              취소
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={isSubmitting}>
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim() || !slug.trim()}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    팀 생성
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
