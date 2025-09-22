import { User, SettingsCategory } from '../types/settings';
import { User as UserIcon, Bell, Users, Palette } from 'lucide-react';

export const getUserInitials = (user: User | null) => {
  if (!user?.name) return 'U';
  return user.name.charAt(0).toUpperCase();
};

export const getProviderDisplayName = (provider: string) => {
  switch (provider) {
    case 'kakao':
      return 'Kakao';
    case 'google':
      return 'Google';
    default:
      return 'Unknown';
  }
};

export const getSettingsCategories = (): SettingsCategory[] => [
  {
    id: 'profile',
    title: '프로필',
    description: '개인 정보 관리',
    icon: UserIcon,
    href: '/settings/profile',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'appearance',
    title: '외관',
    description: '테마 및 디스플레이',
    icon: Palette,
    href: '/settings/appearance',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'team',
    title: '팀 설정',
    description: '팀 정보 및 설정',
    icon: Users,
    href: '/settings/team',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'notifications',
    title: '알림',
    description: '알림 방법 및 설정',
    icon: Bell,
    href: '/settings/notifications',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
];

export const getCategoryDescription = (categoryId: string) => {
  switch (categoryId) {
    case 'profile':
      return '이름, 이메일, 프로필 사진을 관리하세요.';
    case 'appearance':
      return '다크 모드, 언어, 시간 형식을 설정하세요.';
    case 'team':
      return '팀 정보, 멤버 관리, 프로젝트 설정을 관리하세요.';
    case 'notifications':
      return '업무 할당, 마감일 등의 알림을 설정하세요.';
    default:
      return '설정을 관리하세요.';
  }
};
