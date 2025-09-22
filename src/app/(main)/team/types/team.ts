export interface TeamMember {
  id: string;
  name?: string;
  email: string;
  avatar?: string | null;
  role: 'admin' | 'member' | 'viewer';
  isActive: boolean;
  isInvitation: boolean;
  invitedBy?: string;
  taskStats: {
    completed: number;
    current: number;
    overdue: number;
  };
}

export interface TeamStats {
  totalMembers: number;
  adminCount: number;
  activeMembers: number;
  pendingInvitations: number;
}

export interface TeamData {
  members: TeamMember[];
  stats: TeamStats;
}

export interface RoleStat {
  value: string;
  label: string;
  count: number;
  color: string;
}

export interface InvitationData {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

export interface TeamPageState {
  isInviteModalOpen: boolean;
  isTeamCreateModalOpen: boolean;
  actionLoading: string | null;
}
