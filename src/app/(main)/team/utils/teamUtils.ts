import { TeamMember, RoleStat } from '../types/team';

export const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
    default:
      return "bg-gray-400";
  }
};

export const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin':
      return '관리자';
    case 'member':
      return '멤버';
    case 'viewer':
      return '뷰어';
    default:
      return role;
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800';
    case 'member':
      return 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800';
    case 'viewer':
      return 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800';
    default:
      return 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800';
  }
};

export const getInitials = (member: TeamMember) => {
  if (member.isInvitation) {
    return member.email[0].toUpperCase();
  }
  return member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase();
};

export const getDisplayName = (member: TeamMember) => {
  return member.isInvitation ? member.email : member.name || member.email;
};

export const getMemberStatus = (member: TeamMember) => {
  if (member.isInvitation) {
    return 'invitation';
  }
  if (!member.isActive) {
    return 'inactive';
  }
  return 'active';
};

export const formatTaskStats = (stats: TeamMember['taskStats']) => {
  return {
    completed: stats.completed || 0,
    current: stats.current || 0,
    overdue: stats.overdue || 0,
  };
};

export const calculateRoleStats = (members: TeamMember[]): RoleStat[] => {
  const roleCounts = members.reduce((acc, member) => {
    if (member.isInvitation) {
      acc.pending = (acc.pending || 0) + 1;
    } else {
      acc[member.role] = (acc[member.role] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return [
    {
      value: 'all',
      label: '전체',
      count: members.length,
      color: 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800'
    },
    {
      value: 'admin',
      label: '관리자',
      count: roleCounts.admin || 0,
      color: 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800'
    },
    {
      value: 'member',
      label: '멤버',
      count: roleCounts.member || 0,
      color: 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800'
    },
    {
      value: 'viewer',
      label: '뷰어',
      count: roleCounts.viewer || 0,
      color: 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800'
    },
    {
      value: 'pending',
      label: '대기중',
      count: roleCounts.pending || 0,
      color: 'text-yellow-600 border-yellow-200 dark:text-yellow-400 dark:border-yellow-800'
    }
  ];
};

export const filterMembersByRole = (members: TeamMember[], selectedRole: string) => {
  if (selectedRole === 'all') {
    return members;
  }
  
  if (selectedRole === 'pending') {
    return members.filter(member => member.isInvitation);
  }
  
  return members.filter(member => !member.isInvitation && member.role === selectedRole);
};
