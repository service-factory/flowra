"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { LoginModal } from "@/components/login-modal";
import { UserProfile } from "@/components/user-profile";
import TeamInviteModal from "@/components/team-invite-modal";
import TeamCreateModal from "@/components/team-create-modal";
import TeamSelectModal from "@/components/team-select-modal";
import useAuth from "@/hooks/useAuth";
import {
  CheckCircle,
  Users,
  Zap,
  Star,
  ArrowRight,
  ArrowDown,
  Play,
  Target,
  Bot,
  Calendar,
  MessageSquare,
  Clock,
  Rocket
} from "lucide-react";
import { useState, useEffect } from "react";

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamInviteModalOpen, setIsTeamInviteModalOpen] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTeamSelectModalOpen, setIsTeamSelectModalOpen] = useState(false);
  const { isAuthenticated, user, isLoading, hasTeam, refreshTeamData } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="lg" variant="gradient" className="drop-shadow-lg" />
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Flowra
                </span>
<p className="text-xs text-gray-500 -mt-1">사이드 프로젝트 팀을 위한 완벽한 업무 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">확인 중...</span>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">
                    안녕하세요, <span className="font-semibold text-blue-600">{user?.name}</span>님!
                  </span>
                  {!hasTeam && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      onClick={() => setIsTeamCreateModalOpen(true)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      팀 만들기
                    </Button>
                  )}
                  <UserProfile />
                </div>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="text-gray-600 hover:text-gray-900"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    로그인
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    무료로 시작하기
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
<Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-green-100 to-blue-100 text-green-800 border-0">
                <Target className="w-4 h-4 mr-2" />
                🎆 사이드 프로젝트 전용 설계
              </Badge>
              
<h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
사이드 프로젝트의
                </span>
                <br />
<span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  업무와 일정이
                </span>
                <br />
<span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-4xl md:text-6xl">
                  조화롭게 흐르도록
                </span>
              </h1>
              
<p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
<span className="font-bold text-blue-600">Flowra</span>는 사이드 프로젝트 팀을 위해 특별히 설계된 업무 관리 솔루션입니다.<br/>
                <span className="font-semibold text-purple-600">디스코드 연동</span>과 <span className="font-semibold text-green-600">자동화된 일정 관리</span>로 팀워크를 혁신하세요.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                {isAuthenticated ? (
                  hasTeam ? (
                    <>
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                        onClick={() => setIsTeamSelectModalOpen(true)}
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        대시보드로 이동
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsTeamSelectModalOpen(true)}
                      >
                        <Target className="w-5 h-5 mr-2" />
                        업무 관리
                      </Button>
                      <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Play className="w-5 h-5 mr-2" />
                        데모 보기
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="lg" 
                        className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                        onClick={() => setIsTeamCreateModalOpen(true)}
                      >
                        <Users className="w-5 h-5 mr-2" />
                        팀 만들기
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => setIsTeamInviteModalOpen(true)}
                      >
                        <Users className="w-5 h-5 mr-2" />
                        팀에 참여하기
                      </Button>
                      <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <Play className="w-5 h-5 mr-2" />
                        데모 보기
                      </Button>
                    </>
                  )
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      <Rocket className="w-5 h-5 mr-2" />
                      🎯 무료로 체험하기
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
<Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800 border-orange-400 text-orange-600 hover:bg-orange-50">
                      <Play className="w-5 h-5 mr-2" />
                      ⚡ 2분 데모 보기
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
<div className="relative mx-auto max-w-5xl">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">⚡ 실시간 대시보드 미리보기</h3>
                    <p className="text-gray-600 dark:text-gray-300">실제 사용자들이 보는 화면입니다</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center mb-2">
                        <Clock className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">진행 중</span>
                      </div>
                      <div className="h-4 bg-blue-300 dark:bg-blue-700 rounded-full w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-1/2"></div>
                      <div className="h-3 bg-blue-200 dark:bg-blue-800 rounded w-2/3"></div>
                    </div>
                    <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-semibold text-green-800 dark:text-green-200">완료</span>
                      </div>
                      <div className="h-4 bg-green-300 dark:bg-green-700 rounded-full w-2/3 animate-pulse"></div>
                      <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-3/4"></div>
                      <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm font-semibold text-purple-800 dark:text-purple-200">예정</span>
                      </div>
                      <div className="h-4 bg-purple-300 dark:bg-purple-700 rounded-full w-4/5 animate-pulse"></div>
                      <div className="h-3 bg-purple-200 dark:bg-purple-800 rounded w-2/3"></div>
                      <div className="h-3 bg-purple-200 dark:bg-purple-800 rounded w-3/4"></div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">💡 이 모든 것이 자동으로 업데이트됩니다!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
<span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
🎆 사이드 프로젝트를 위한 특별한 기능
              </span>
            </h2>
<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
제한된 인력과 시간에 최적화된 기능들로<br/>
              <span className="font-semibold text-blue-600">효율적인 팀 커뮤니케이션과 업무 관리</span>를 경험하세요
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
<CardTitle className="text-xl">📅 자동화된 일정 관리</CardTitle>
                <CardDescription className="text-base">
                  마감일 전날 자동 알림과 일정 조정 기능으로 효율적인 시간 관리
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
마감일 전날 자동 알림 발송
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
디스코드에서 일정 조정 가능
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
앱과 실시간 동기화
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
<CardTitle className="text-xl">🎯 직관적인 대시보드</CardTitle>
                <CardDescription className="text-base">
팀 전체 업무 상태를 한눈에 확인하고 우선순위에 따라 정렬
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
칸반 보드 및 리스트 뷰 지원
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
업무 우선순위 및 마감일 기준 정렬
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
캘린더 뷰로 일정 시각화
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
<CardTitle className="text-xl">🤝 디스코드 완벽 연동</CardTitle>
                <CardDescription className="text-base">
                  기존 팀 소통 방식 그대로, 업무 관리까지 한 번에
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
디스코드에서 직접 업무 생성
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
실시간 업무 현황 공유
          </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
자동 일정 조정 알림
          </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              🤝 디스코드와 완벽하게 연동
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              팀이 이미 사용하는 디스코드에서 자연스럽게 업무를 관리하세요.<br/>
              <span className="font-bold text-yellow-300">컨텍스트 스위칭 없이</span> 소통과 업무 관리를 한 번에!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-yellow-300">📝 디스코드에서 직접 업무 생성</h3>
                <p className="text-blue-100 mb-4">채팅 중에 떠오른 아이디어나 업무를 바로 등록하세요.</p>
                <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400">/task 로그인 페이지 디자인 @김디자인 12월 25일</div>
                  <div className="text-gray-400 mt-2">✅ 업무가 생성되었습니다!</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-yellow-300">⏰ 자동 알림 및 일정 조정</h3>
                <p className="text-blue-100 mb-4">마감일 전날 자동으로 멘션 알림이 발송됩니다.</p>
                <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-yellow-400">🔔 @김디자인 내일(12/25)이 &ldquo;로그인 페이지 디자인&rdquo; 마감일입니다!</div>
                  <div className="text-blue-400 mt-2">일정 조정이 필요하면 /reschedule 명령어를 사용하세요.</div>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 text-yellow-300">✅ 완료 확인 및 통계</h3>
                <p className="text-blue-100 mb-4">마감일에 완료 여부를 확인하고 팀 성과를 분석합니다.</p>
                <div className="bg-gray-900/50 rounded-lg p-4 font-mono text-sm">
                  <div className="text-green-400">🎉 &ldquo;로그인 페이지 디자인&rdquo;이 완료되었습니다!</div>
                  <div className="text-gray-400 mt-2">팀 완료율: 95% | 평균 준수율: 92%</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 rounded-3xl p-8 backdrop-blur-sm">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">실시간 워크플로우</h3>
                  <p className="text-blue-100">디스코드 ↔ Flowra 완벽 동기화</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-blue-500/20 rounded-xl">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-white">디스코드에서 업무 생성</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-green-500/20 rounded-xl">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white">Flowra 대시보드에 실시간 반영</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-yellow-300" />
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-purple-500/20 rounded-xl">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-white">자동 알림 및 진행 상황 공유</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
<h2 className="text-4xl md:text-5xl font-bold mb-6">
              💰 마감일 놓쳤을 때의 비용을 아세요
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              <span className="font-bold text-yellow-300">마감일 1일 놓칠 때마다 손해: 프로젝트 비용의 20%</span><br/>
              Flowra로 이 비용을 절약하세요!
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
<div className="text-4xl md:text-5xl font-bold text-yellow-300">95%</div>
              <div className="text-blue-100">마감일 초과 방지</div>
            </div>
            <div className="space-y-2">
<div className="text-4xl md:text-5xl font-bold text-green-300">3시간</div>
              <div className="text-blue-100">주간 회의시간 절약</div>
            </div>
            <div className="space-y-2">
<div className="text-4xl md:text-5xl font-bold text-blue-300">200%</div>
              <div className="text-blue-100">팀 생산성 향상</div>
            </div>
            <div className="space-y-2">
<div className="text-4xl md:text-5xl font-bold text-red-300">0원</div>
              <div className="text-blue-100">완전 무료</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
<span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                😭 진짜 사용자들의 솔직한 후기
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
<p className="text-gray-600 dark:text-gray-300 mb-4">
&ldquo;사이드 프로젝트인데 회사만큼 체계적으로 관리할 수 있어요! 디스코드에서 바로 업무 생성하고, 자동으로 마감일 알림까지... 이제 우리도 프로 팀처럼 일할 수 있네요.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">김</span>
                  </div>
                  <div>
<div className="font-semibold">김개발</div>
                    <div className="text-sm text-gray-500">앱 개발 사이드 프로젝트 | 개발팀 리드</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
<p className="text-gray-600 dark:text-gray-300 mb-4">
&ldquo;개발자 3명, 디자이너 2명으로 진행하는 사이드 프로젝트인데 정말 프로같아요! 일정 조정도 디스코드에서 바로 되고, 누가 뭘 하고 있는지 대시보드에서 한번에 확인돼요.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-400 font-semibold">이</span>
                  </div>
                  <div>
<div className="font-semibold">이디자인</div>
                    <div className="text-sm text-gray-500">웹앱 개발 사이드 프로젝트 | PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
<p className="text-gray-600 dark:text-gray-300 mb-4">
&ldquo;마감일 하루 전에 디스코드로 자동 알림이 와요! 예전에는 &lsquo;어? 이거 언제까지였지?&rsquo; 하며 허둥댔는데, 이제는 여유롭게 미리미리 준비할 수 있어요.&rdquo;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">박</span>
                  </div>
                  <div>
<div className="font-semibold">박기획</div>
                    <div className="text-sm text-gray-500">게임 개발 사이드 프로젝트 | 개발자</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🤖 자동화로 팀워크가 완전히 달라집니다
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              반복적인 일정 관리와 진행 상황 확인이 자동으로 처리되어, 팀이 진짜 중요한 일에만 집중할 수 있어요
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">자동 마감일 알림</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    마감일 하루 전 디스코드로 자동 멘션. 팀원들이 깜빡하고 넘어가는 일이 사라져요.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">완료 확인 자동화</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    마감일에 자동으로 완료 여부를 확인하고, 앱에서 실시간으로 상태가 업데이트돼요.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">일정 조정 간소화</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    디스코드에서 메시지로 일정 조정하면 앱과 실시간 동기화. 별도 회의 필요 없어요.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">⚡ 자동화 워크플로우</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <span className="font-medium">업무 생성 (앱 또는 디스코드)</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <span className="font-medium">자동 마감일 알림 (D-1)</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
                <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-700 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <span className="font-medium">완료 확인 및 자동 업데이트</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
🚀 사이드 프로젝트 팀도 이제 프로처럼!
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            <span className="font-bold text-yellow-300">디스코드 연동 + 자동 일정 관리로 팀워크 혁명!</span><br/>
            더 이상 &quot;누가 이거 언제까지 하기로 했지?&quot; 라는 말은 없을 거예요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              hasTeam ? (
                <>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                    onClick={() => setIsTeamSelectModalOpen(true)}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    대시보드로 이동
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-6 border-white text-white hover:bg-white/10"
                    onClick={() => setIsTeamSelectModalOpen(true)}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    팀 관리
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                    onClick={() => setIsTeamCreateModalOpen(true)}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    팀 만들기
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto text-lg px-8 py-6 border-white text-white hover:bg-white/10"
                    onClick={() => setIsTeamInviteModalOpen(true)}
                  >
                    <Users className="w-5 h-5 mr-2" />
                    팀에 참여하기
                  </Button>
                </>
              )
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  🎯 지금 무료로 체험
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto text-lg px-8 py-6 border-white text-white hover:bg-white/10"
                  onClick={() => setIsTeamInviteModalOpen(true)}
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  🚀 다른 팀도 초대하기
                </Button>
              </>
            )}
          </div>
<p className="text-blue-100 text-sm mt-4 bg-white/10 rounded-full px-6 py-3 inline-block">
            💳 신용카드 불필요 • ⚡ 3분만에 팀 세팅 • 🔒 완전 무료 • 🤝 디스코드 즉시 연동
          </p>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="md" variant="white" />
                <span className="text-xl font-bold">Flowra</span>
              </div>
<p className="text-gray-400 text-sm">
                🚀 마감일 스트레스 없는 팀 문화, Flowra와 함께 시작하세요.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">제품</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">업무 관리</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">일정 조율</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">디스코드 연동</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">알림 시스템</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">지원</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">도움말</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">문의하기</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">커뮤니티</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">상태</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">회사</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">소개</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">블로그</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">채용</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">연락처</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Flowra. All rights reserved. Made with ❤️ for side project teams.</p>
          </div>
        </div>
      </footer>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />

      <TeamInviteModal 
        isOpen={isTeamInviteModalOpen} 
        onClose={() => setIsTeamInviteModalOpen(false)}
onInvite={(invitations) => {
          console.log('팀 초대:', invitations);
        }}
      />

      <TeamCreateModal 
        isOpen={isTeamCreateModalOpen} 
        onClose={() => setIsTeamCreateModalOpen(false)}
onCreate={async () => {
          await refreshTeamData();
          window.location.href = '/dashboard?teamId=0';
        }}
      />

      <TeamSelectModal
        isOpen={isTeamSelectModalOpen}
        onClose={() => setIsTeamSelectModalOpen(false)}
        redirectPath="/dashboard"
      />
    </div>
  );
};

export default Home;
