import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFetch, postFetch, putFetch, deleteFetch } from '@/lib/requests/customFetch';

// Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'admin' | 'member' | 'viewer';
  permissions: Record<string, boolean>;
  joinDate: string;
  lastActive: string | null;
  isActive: boolean;
  taskStats: {
    completed: number;
    current: number;
    overdue: number;
  };
  isInvitation: false;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
  isInvitation: true;
}

export type MemberOrInvitation = TeamMember | TeamInvitation;

export interface TeamMembersData {
  success: boolean;
  error?: string;
  members: TeamMember[];
  invitations: TeamInvitation[];
  stats: {
    totalMembers: number;
    activeMembers: number;
    adminCount: number;
    memberCount: number;
    viewerCount: number;
    pendingInvitations: number;
  };
}

export interface InvitationData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
}

export function useTeamMembers(teamId: string | null) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // 팀원 및 초대 목록 조회
  const {
    data: teamMembersData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['teamMembers', teamId],
    queryFn: async (): Promise<TeamMembersData> => {
      if (!teamId) {
        console.warn('팀 ID가 없습니다:', teamId);
        throw new Error('팀 ID가 필요합니다');
      }

      console.log('팀원 데이터 요청:', teamId);
      const response = await getFetch<undefined, TeamMembersData>({
        url: `/api/teams/${teamId}/members`
      });
      
      console.log('🔍 팀원 데이터 응답:', response);
      console.log('🔍 members 타입:', typeof response.members, 'length:', response.members?.length);
      console.log('🔍 invitations 타입:', typeof response.invitations, 'length:', response.invitations?.length);
      
      if (!response.success) {
        throw new Error(response.error || '팀원 데이터를 불러올 수 없습니다');
      }

      return response;
    },
    enabled: !!teamId && teamId !== 'null' && teamId !== 'undefined',
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 10, // 10분
    retry: (failureCount, error) => {
      console.error(`팀원 데이터 요청 실패 (${failureCount}회):`, error);
      return failureCount < 2; // 최대 2회 재시도
    },
  });

  // 팀원 초대 뮤테이션
  const inviteMembersMutation = useMutation({
    mutationFn: async (invitations: InvitationData[]) => {
      if (!teamId) throw new Error('팀 ID가 필요합니다');

      const response = await postFetch<{ invitations: InvitationData[] }, { success: boolean; data?: unknown; error?: string }>({
        url: `/api/teams/${teamId}/members`,
        body: { invitations }
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
    },
  });

  // 팀원 역할 변경 뮤테이션
  const updateMemberRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: 'admin' | 'member' | 'viewer' }) => {
      if (!teamId) throw new Error('팀 ID가 필요합니다');

      const response = await putFetch<{ role: string }, { success: boolean; data?: unknown; error?: string }>({
        url: `/api/teams/${teamId}/members?memberId=${memberId}`,
        body: { role }
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
    },
  });

  // 팀원 제거 뮤테이션
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!teamId) throw new Error('팀 ID가 필요합니다');

      const response = await deleteFetch<undefined, { success: boolean; data?: unknown; error?: string }>({
        url: `/api/teams/${teamId}/members?memberId=${memberId}`
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
    },
  });

  // 초대 취소 뮤테이션
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!teamId) throw new Error('팀 ID가 필요합니다');

      const response = await deleteFetch<undefined, { success: boolean; data?: unknown; error?: string }>({
        url: `/api/teams/${teamId}/members?invitationId=${invitationId}`
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
    },
  });

  // 초대 재전송 뮤테이션
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      if (!teamId) throw new Error('팀 ID가 필요합니다');

      const response = await postFetch<Record<string, never>, { success: boolean; data?: unknown; error?: string }>({
        url: `/api/teams/${teamId}/invitations/${invitationId}/resend`,
        body: {}
      });
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teamMembers', teamId] });
    },
  });

  // 필터링된 멤버 목록
  const filteredMembers = teamMembersData 
    ? [...(teamMembersData.members || []), ...(teamMembersData.invitations || [])].filter(member => {
        const name = 'name' in member ? member.name : member.email;
        const position = 'taskStats' in member ? '' : ''; // 포지션 필드가 없으므로 빈 문자열
        
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             position.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = selectedRole === 'all' || member.role === selectedRole;
        
        return matchesSearch && matchesRole;
      })
    : [];

  // 역할별 통계
  const roleStats = teamMembersData ? [
    { 
      value: 'all', 
      label: '전체', 
      count: teamMembersData.stats.totalMembers + teamMembersData.stats.pendingInvitations,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' 
    },
    { 
      value: 'admin', 
      label: '관리자', 
      count: teamMembersData.stats.adminCount,
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
    },
    { 
      value: 'member', 
      label: '멤버', 
      count: teamMembersData.stats.memberCount,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
    },
    { 
      value: 'viewer', 
      label: '뷰어', 
      count: teamMembersData.stats.viewerCount,
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' 
    },
  ] : [];

  // 핸들러 함수들
  const handleInviteMembers = async (invitations: InvitationData[]) => {
    try {
      await inviteMembersMutation.mutateAsync(invitations);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '초대에 실패했습니다' 
      };
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      await updateMemberRoleMutation.mutateAsync({ memberId, role });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '역할 변경에 실패했습니다' 
      };
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync(memberId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '멤버 제거에 실패했습니다' 
      };
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitationMutation.mutateAsync(invitationId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '초대 취소에 실패했습니다' 
      };
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      await resendInvitationMutation.mutateAsync(invitationId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '초대 재전송에 실패했습니다' 
      };
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return {
    // 데이터
    teamMembersData,
    filteredMembers,
    roleStats,
    
    // 상태
    isLoading,
    error,
    searchTerm,
    selectedRole,
    
    // 로딩 상태
    isInviting: inviteMembersMutation.isPending,
    isUpdatingRole: updateMemberRoleMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    isCancelling: cancelInvitationMutation.isPending,
    isResending: resendInvitationMutation.isPending,
    
    // 액션
    setSearchTerm,
    setSelectedRole,
    handleInviteMembers,
    handleUpdateMemberRole,
    handleRemoveMember,
    handleCancelInvitation,
    handleResendInvitation,
    handleRefresh,
  };
}
