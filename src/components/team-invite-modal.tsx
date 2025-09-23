"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  UserPlus,
  Users,
  Crown,
  Eye,
  CheckCircle,
  Plus,
  X,
} from "lucide-react";

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

interface TeamInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invitations: InvitationData[]) => void;
  teamId?: string;
}

interface InvitationData {
  email: string;
  role: "admin" | "member" | "viewer";
  message?: string;
}


const roleOptions = [
  {
    value: "admin",
    label: "관리자",
    description: "팀 설정, 멤버 관리, 모든 업무 관리 가능",
    icon: Crown,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  {
    value: "member",
    label: "멤버",
    description: "업무 생성, 수정, 완료 가능",
    icon: Users,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
  {
    value: "viewer",
    label: "뷰어",
    description: "업무 조회만 가능",
    icon: Eye,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-900/20",
    borderColor: "border-gray-200 dark:border-gray-800",
  },
];


const TeamInviteModal = ({ isOpen, onClose, onInvite }: TeamInviteModalProps) => {
  const [invitations, setInvitations] = useState<InvitationData[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [currentRole, setCurrentRole] = useState<"admin" | "member" | "viewer">("member");
  const [currentMessage, setCurrentMessage] = useState("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(currentEmail) || currentEmail === "");
  }, [currentEmail]);

  const handleAddInvitation = () => {
    if (!currentEmail || !isValidEmail) return;

    // Check for duplicate email
    if (invitations.some(inv => inv.email.toLowerCase() === currentEmail.toLowerCase())) {
      return;
    }

    const newInvitation: InvitationData = {
      email: currentEmail,
      role: currentRole,
      message: currentMessage.trim() || undefined,
    };

    setInvitations([...invitations, newInvitation]);
    setCurrentEmail("");
    setCurrentMessage("");
    setCurrentRole("member");
  };

  const handleRemoveInvitation = (email: string) => {
    setInvitations(invitations.filter(inv => inv.email !== email));
  };

  const handleSubmit = async () => {
    if (invitations.length === 0) return;

    setIsSubmitting(true);
    try {
      await onInvite(invitations);
      setInvitations([]);
      setCurrentEmail("");
      setCurrentMessage("");
      setCurrentRole("member");
      onClose();
    } catch (error) {
      console.error("Failed to send invitations:", error);
      // 에러가 발생해도 모달을 닫지 않고 사용자가 다시 시도할 수 있도록 함
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentEmail && isValidEmail) {
      handleAddInvitation();
    }
  };

  const getRoleInfo = (role: string) => {
    return roleOptions.find(option => option.value === role) || roleOptions[1];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>팀원 초대</span>
          </DialogTitle>
          <DialogDescription>
            이메일로 팀원을 초대하고 역할을 설정하세요. 초대장은 7일간 유효합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-6">
          {/* Add New Invitations */}
          <div className="space-y-4">
            <h3 className="font-medium">새 초대 추가</h3>
            
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일 주소</Label>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={currentEmail}
                    onChange={(e) => setCurrentEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className={!isValidEmail && currentEmail ? "border-red-300 focus:border-red-500" : ""}
                  />
                  {!isValidEmail && currentEmail && (
                    <p className="text-sm text-red-600 mt-1">올바른 이메일 주소를 입력하세요</p>
                  )}
                </div>
                <Button
                  onClick={handleAddInvitation}
                  disabled={!currentEmail || !isValidEmail}
                  className="px-6"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  추가
                </Button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label>역할</Label>
              <div className="grid grid-cols-3 gap-3">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = currentRole === option.value;
                  
                  return (
                    <div
                      key={option.value}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? `${option.bgColor} ${option.borderColor} border-2`
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                      onClick={() => setCurrentRole(option.value as "admin" | "member" | "viewer")}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <Icon className={`h-4 w-4 ${option.color}`} />
                        <span className={`font-medium ${isSelected ? option.color : "text-gray-900 dark:text-white"}`}>
                          {option.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Personal Message */}
            <div className="space-y-2">
              <Label htmlFor="message">개인 메시지 (선택사항)</Label>
              <Textarea
                id="message"
                placeholder="초대와 함께 전달할 메시지를 작성하세요..."
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Invitation List */}
          {invitations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium">초대 목록 ({invitations.length}명)</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {invitations.map((invitation, index) => {
                  const roleInfo = getRoleInfo(invitation.role);
                  const Icon = roleInfo.icon;
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${roleInfo.bgColor} ${roleInfo.borderColor} border`}>
                          <Icon className={`h-4 w-4 ${roleInfo.color}`} />
                        </div>
                        <div>
                          <div className="font-medium">{invitation.email}</div>
                          <div className="text-sm text-gray-500">
                            {roleInfo.label}
                            {invitation.message && " • 메시지 포함"}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInvitation(invitation.email)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4" />
            <span>초대장은 7일간 유효합니다</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={invitations.length === 0 || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  전송 중...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  {invitations.length}명 초대
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeamInviteModal;
