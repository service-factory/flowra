"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TeamSelector } from "./team-selector";
import { TeamCreateModal } from "./team-create-modal";
import { TeamInviteModal } from "./team-invite-modal";
import { useAuth } from "@/hooks/useAuth";

interface TeamSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath?: string;
}

export function TeamSelectModal({ 
  isOpen, 
  onClose, 
  redirectPath = "/dashboard" 
}: TeamSelectModalProps) {
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTeamInviteModalOpen, setIsTeamInviteModalOpen] = useState(false);
  const { refreshTeamData } = useAuth();
  const router = useRouter();

  const handleTeamSelect = async (teamId: string) => {
    // 팀 데이터 새로고침으로 currentTeam 업데이트
    await refreshTeamData();
    // URL 파라미터로 팀 ID 전달
    router.push(`${redirectPath}?teamId=${teamId}`);
    onClose();
  };

  const handleTeamCreate = () => {
    setIsTeamCreateModalOpen(true);
  };

  const handleTeamJoin = () => {
    setIsTeamInviteModalOpen(true);
  };

  const handleTeamCreateSuccess = async () => {
    await refreshTeamData();
    setIsTeamCreateModalOpen(false);
    onClose();
  };

  const handleTeamInviteSuccess = () => {
    setIsTeamInviteModalOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              팀 선택
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-gray-400">
              어떤 팀의 대시보드로 이동하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <TeamSelector
              onTeamSelect={handleTeamSelect}
              onTeamCreate={handleTeamCreate}
              onTeamJoin={handleTeamJoin}
              showCreateButton={true}
              showJoinButton={true}
            />
          </div>
        </DialogContent>
      </Dialog>

      <TeamCreateModal
        isOpen={isTeamCreateModalOpen}
        onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={handleTeamCreateSuccess}
      />

      <TeamInviteModal
        isOpen={isTeamInviteModalOpen}
        onClose={() => setIsTeamInviteModalOpen(false)}
        onInvite={handleTeamInviteSuccess}
      />
    </>
  );
}
