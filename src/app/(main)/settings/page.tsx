'use client';

import { SettingsNavigation } from './components/SettingsNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { User, Bell, Users, Palette } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            설정 페이지에 접근하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SettingsNavigation />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              계정 및 앱 설정을 관리하여 Flowra를 개인화하세요
            </p>
          </div>

          {/* Quick Settings Overview */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>계정 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{user?.name || '사용자'}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                      {user?.provider || 'Unknown'} 계정
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
              <Link href="/settings/profile">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">프로필</CardTitle>
                      <CardDescription>개인 정보 관리</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    이름, 이메일, 프로필 사진을 관리하세요.
                  </p>
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
                    설정하기
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Appearance Settings */}
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
              <Link href="/settings/appearance">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">외관</CardTitle>
                      <CardDescription>테마 및 디스플레이</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    다크 모드, 언어, 시간 형식을 설정하세요.
                  </p>
                  <div className="flex items-center text-sm text-purple-600 dark:text-purple-400 font-medium">
                    설정하기
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Team Settings */}
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
              <Link href="/settings/team">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">팀 설정</CardTitle>
                      <CardDescription>팀 정보 및 설정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    팀 정보, 멤버 관리, 프로젝트 설정을 관리하세요.
                  </p>
                  <div className="flex items-center text-sm text-green-600 dark:text-green-400 font-medium">
                    설정하기
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Link>
            </Card>

            {/* Notification Settings */}
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
              <Link href="/settings/notifications">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/50 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">알림</CardTitle>
                      <CardDescription>알림 방법 및 설정</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    업무 할당, 마감일 등의 알림을 설정하세요.
                  </p>
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 font-medium">
                    설정하기
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
