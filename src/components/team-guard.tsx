"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamCreateModal } from "@/components/team-create-modal";
import { TeamInviteModal } from "@/components/team-invite-modal";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Building2, 
  UserPlus, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Sparkles
} from "lucide-react";

interface TeamGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function TeamGuard({ children, fallback }: TeamGuardProps) {
  const { isAuthenticated, hasTeam, isLoading } = useAuth();
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTeamInviteModalOpen, setIsTeamInviteModalOpen] = useState(false);

  // 로딩 중인 경우 - 로딩 화면 표시
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center animate-in fade-in duration-200">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            팀 정보를 확인하는 중...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            잠시만 기다려주세요
          </p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // 팀이 있는 경우
  if (hasTeam) {
    return <>{children}</>;
  }

  // 팀이 없는 경우 - 기본 fallback 또는 커스텀 fallback
  if (fallback) {
    return <>{fallback}</>;
  }

  // 기본 팀 생성 안내 화면
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate-in fade-in duration-300">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                팀에 참여하거나
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                새 팀을 만들어보세요
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Flowra를 사용하려면 팀에 속해야 합니다. 
              <span className="font-semibold text-blue-600">새 팀을 만들거나</span> 
              기존 팀에 초대받으세요.
            </p>
          </div>

          {/* 액션 카드들 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 팀 생성 카드 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl">새 팀 만들기</CardTitle>
                <CardDescription className="text-base">
                  팀을 생성하고 멤버들을 초대하여 함께 업무를 관리해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    팀 이름과 URL 설정
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    멤버 초대 및 역할 설정
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    디스코드 연동 설정
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    즉시 업무 관리 시작
                  </li>
                </ul>
                <Button 
                  onClick={() => setIsTeamCreateModalOpen(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  팀 생성하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* 팀 초대 카드 */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl">팀에 초대받기</CardTitle>
                <CardDescription className="text-base">
                  팀 관리자가 보낸 초대장을 통해 기존 팀에 참여하세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    이메일로 초대장 수신
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    초대장 링크 클릭으로 참여
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    팀의 기존 업무 확인
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-3" />
                    즉시 협업 시작
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  onClick={() => setIsTeamInviteModalOpen(true)}
                  className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  초대장 확인하기
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 도움말 섹션 */}
          <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    도움이 필요하신가요?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    팀 생성이나 초대 과정에서 문제가 있으시면 언제든지 문의해주세요.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <Sparkles className="w-4 h-4 mr-1" />
                      가이드 보기
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      문의하기
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 팀 생성 모달 */}
      <TeamCreateModal 
        isOpen={isTeamCreateModalOpen} 
        onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async (teamData) => {
          console.log('팀 생성:', teamData);
          // TODO: 실제 API 호출 구현
          // 성공 시 페이지 새로고침 또는 상태 업데이트
        }}
      />

      {/* 팀 초대 모달 */}
      <TeamInviteModal 
        isOpen={isTeamInviteModalOpen} 
        onClose={() => setIsTeamInviteModalOpen(false)}
        onInvite={(invitations) => {
          console.log('팀 초대:', invitations);
          // TODO: 실제 API 호출 구현
        }}
      />
    </div>
  );
}
