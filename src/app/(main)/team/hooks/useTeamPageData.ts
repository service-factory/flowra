import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useTeamMembers, type InvitationData } from '@/hooks/useTeamMembers';
import { TeamPageState, InvitationData as TeamInvitationData } from '../types/team';

export const useTeamPageData = () => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  
  const { currentTeam, refreshTeamData } = useAuth();
  
  const actualTeamId = useMemo(() => {
    if (teamId === '0' || !teamId) {
      return currentTeam?.id || null;
    }
    return teamId;
  }, [teamId, currentTeam?.id]);

  const {
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
    setSelectedRole,
    handleInviteMembers,
    handleRemoveMember,
    handleCancelInvitation,
    handleResendInvitation,
    handleRefresh,
  } = useTeamMembers(actualTeamId);

  const onInviteMembers = useCallback(async (invitations: TeamInvitationData[]) => {
    const result = await handleInviteMembers(invitations as InvitationData[]);
    if (result.success) {
      setIsInviteModalOpen(false);
    } else {
      console.error('초대 실패:', result.error);
    }
  }, [handleInviteMembers]);

  const onResendInvitation = useCallback(async (invitationId: string) => {
    setActionLoading(`resend-${invitationId}`);
    const result = await handleResendInvitation(invitationId);
    if (!result.success) {
      console.error('재전송 실패:', result.error);
    }
    setActionLoading(null);
  }, [handleResendInvitation]);

  const onCancelInvitation = useCallback(async (invitationId: string) => {
    setActionLoading(`cancel-${invitationId}`);
    const result = await handleCancelInvitation(invitationId);
    if (!result.success) {
      console.error('취소 실패:', result.error);
    }
    setActionLoading(null);
  }, [handleCancelInvitation]);

  const onRemoveMember = useCallback(async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 팀에서 제거하시겠습니까?')) return;
    
    setActionLoading(`remove-${memberId}`);
    const result = await handleRemoveMember(memberId);
    if (!result.success) {
      console.error('제거 실패:', result.error);
    }
    setActionLoading(null);
  }, [handleRemoveMember]);

  const openInviteModal = useCallback(() => {
    setIsInviteModalOpen(true);
  }, []);

  const closeInviteModal = useCallback(() => {
    setIsInviteModalOpen(false);
  }, []);

  const openTeamCreateModal = useCallback(() => {
    setIsTeamCreateModalOpen(true);
  }, []);

  const closeTeamCreateModal = useCallback(() => {
    setIsTeamCreateModalOpen(false);
  }, []);

  const handleTeamCreate = useCallback(async () => {
    await refreshTeamData();
    if (currentTeam) {
      window.location.href = `/team?teamId=${currentTeam.id}`;
    } else {
      window.location.href = '/team?teamId=0';
    }
  }, [refreshTeamData, currentTeam]);

  const state: TeamPageState = {
    isInviteModalOpen,
    isTeamCreateModalOpen,
    actionLoading,
  };

  return {
    actualTeamId,
    currentTeam,
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
  };
};
