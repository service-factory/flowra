"use client";

import { TeamGuard } from "@/components/team-guard";
import { TeamInviteModal } from "@/components/team-invite-modal";
import { TeamCreateModal } from "@/components/team-create-modal";
import { TeamHeader } from "./components/TeamHeader";
import { TeamFilters } from "./components/TeamFilters";
import { TeamMembersGrid } from "./components/TeamMembersGrid";
import { useTeamPageData } from "./hooks/useTeamPageData";
import { 
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TeamPage() {
  const {
    actualTeamId,
    teamMembersData,
    filteredMembers,
    roleStats,
    isLoading,
    error,
    selectedRole,
    isInviting,
    isRemoving,
    isCancelling,
    isResending,
    state,
    setSelectedRole,
    onInviteMembers,
    onResendInvitation,
    onCancelInvitation,
    onRemoveMember,
    handleRefresh,
    openInviteModal,
    closeInviteModal,
    openTeamCreateModal,
    closeTeamCreateModal,
    handleTeamCreate,
  } = useTeamPageData();


  if (isLoading) {
    return (
      <TeamGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">팀원 목록을 불러오는 중...</p>
          </div>
        </div>
      </TeamGuard>
    );
  }

  if (error) {
    return (
      <TeamGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                데이터를 불러올 수 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </TeamGuard>
    );
  }

  return (
    <TeamGuard>
      <div>
        <TeamHeader
          stats={teamMembersData?.stats}
          isInviting={isInviting}
          isLoading={isLoading}
          onInviteClick={openInviteModal}
          onSettingsClick={openTeamCreateModal}
        />

        <TeamFilters
          roleStats={roleStats}
          selectedRole={selectedRole}
          isLoading={isLoading}
          onRoleChange={setSelectedRole}
        />

        <TeamMembersGrid
          members={(filteredMembers || []) as any[]}
          actionLoading={state.actionLoading}
          isResending={isResending}
          isCancelling={isCancelling}
          isRemoving={isRemoving}
          isLoading={isLoading}
          onResendInvitation={onResendInvitation}
          onCancelInvitation={onCancelInvitation}
          onRemoveMember={onRemoveMember}
        />
      </div>

      <TeamInviteModal
        isOpen={state.isInviteModalOpen}
        onClose={closeInviteModal}
        onInvite={onInviteMembers}
        teamId={actualTeamId || ''}
      />

      <TeamCreateModal 
        isOpen={state.isTeamCreateModalOpen} 
        onClose={closeTeamCreateModal}
        onCreate={handleTeamCreate}
      />
    </TeamGuard>
  );
}
