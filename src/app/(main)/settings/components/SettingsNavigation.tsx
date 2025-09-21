'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  User,
  Bell,
  Users,
  Palette,
  ChevronRight
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'profile',
    label: '프로필',
    icon: User,
    href: '/settings/profile',
    description: '이름, 이메일, 프로필 사진'
  },
  {
    id: 'appearance',
    label: '외관',
    icon: Palette,
    href: '/settings/appearance',
    description: '테마, 언어, 시간 형식'
  },
  {
    id: 'team',
    label: '팀 설정',
    icon: Users,
    href: '/settings/team',
    description: '팀 정보 및 설정'
  },
  {
    id: 'notifications',
    label: '알림',
    icon: Bell,
    href: '/settings/notifications',
    description: '알림 방법 및 설정'
  },
];

export function SettingsNavigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          설정 메뉴
          <ChevronRight 
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-90"
            )} 
          />
        </button>
      </div>

      {/* Navigation sidebar */}
      <div className={cn(
        "lg:block w-full lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
        isOpen ? "block" : "hidden"
      )}>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              설정
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              계정 및 앱 설정을 관리하세요
            </p>
          </div>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-start space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.label}</div>
                    <div className={cn(
                      "text-xs mt-0.5",
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full flex-shrink-0 mt-2" />
                  )}
                </Link>
              );
            })}
          </nav>

        </div>
      </div>
    </>
  );
}
