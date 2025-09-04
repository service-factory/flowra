"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  Play,
  Sparkles,
  Target,
  Calendar,
  Bell,
  Bot
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="lg" variant="gradient" className="drop-shadow-lg" />
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Flowra
                </span>
                <p className="text-xs text-gray-500 -mt-1">팀워크의 새로운 시작</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  무료로 시작하기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-5xl mx-auto">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 mr-2" />
                사이드 프로젝트 팀을 위한 특별한 솔루션
              </Badge>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
                  팀 업무가
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  조화롭게 흐르도록
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                복잡한 업무 관리 도구는 이제 그만! 
                <span className="font-semibold text-blue-600">직관적이고 간단한</span> 방식으로 
                팀의 생산성을 극대화하세요.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/auth/login">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <Zap className="w-5 h-5 mr-2" />
                    지금 시작하기
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <Play className="w-5 h-5 mr-2" />
                  데모 보기
                </Button>
              </div>
            </div>

            {/* Hero Image/Dashboard Preview */}
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative mx-auto max-w-4xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-blue-200 dark:bg-blue-800 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-green-200 dark:bg-green-800 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-purple-200 dark:bg-purple-800 rounded w-4/5"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                왜 Flowra를 선택해야 할까요?
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              복잡한 도구 대신 <span className="font-semibold text-blue-600">직관적이고 간단한</span> 업무 관리 경험을 제공합니다
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">직관적인 업무 관리</CardTitle>
                <CardDescription className="text-base">
                  복잡한 설정 없이 바로 시작할 수 있는 간단한 인터페이스
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    드래그 앤 드롭으로 간편한 업무 이동
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    한 눈에 보는 업무 현황
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    스마트한 우선순위 자동 설정
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bell className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">스마트 알림 시스템</CardTitle>
                <CardDescription className="text-base">
                  놓치기 쉬운 마감일과 중요한 업무를 자동으로 알려드립니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    마감일 1일 전 자동 알림
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    디스코드와 연동된 실시간 알림
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    개인화된 알림 설정
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">디스코드 완벽 연동</CardTitle>
                <CardDescription className="text-base">
                  기존 팀 소통 방식 그대로, 업무 관리까지 한 번에
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    디스코드에서 바로 업무 생성
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

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              이미 많은 팀이 선택한 이유
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              사이드 프로젝트부터 스타트업까지, 다양한 팀이 Flowra와 함께 성장하고 있습니다
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">500+</div>
              <div className="text-blue-100">활성 팀</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">10K+</div>
              <div className="text-blue-100">완료된 업무</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">95%</div>
              <div className="text-blue-100">만족도</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold">24/7</div>
              <div className="text-blue-100">지원</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                사용자들의 생생한 후기
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
                  "복잡한 도구들 때문에 시간을 많이 낭비했는데, Flowra는 정말 직관적이에요. 
                  팀원들도 금방 적응했고 업무 효율이 확실히 좋아졌습니다."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">김</span>
                  </div>
                  <div>
                    <div className="font-semibold">김개발</div>
                    <div className="text-sm text-gray-500">스타트업 CTO</div>
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
                  "디스코드 연동이 정말 편해요! 채팅하면서 바로 업무를 생성하고 관리할 수 있어서 
                  컨텍스트 스위칭이 줄어들었습니다."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 dark:text-green-400 font-semibold">이</span>
                  </div>
                  <div>
                    <div className="font-semibold">이디자인</div>
                    <div className="text-sm text-gray-500">프리랜서 디자이너</div>
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
                  "사이드 프로젝트 팀 관리가 이렇게 쉬울 줄 몰랐어요. 
                  마감일 놓치는 일도 없어지고 팀원들 간 소통도 훨씬 원활해졌습니다."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mr-3">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">박</span>
                  </div>
                  <div>
                    <div className="font-semibold">박기획</div>
                    <div className="text-sm text-gray-500">사이드 프로젝트 PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            복잡한 설정 없이, 몇 분 안에 팀의 업무 관리가 완전히 바뀝니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
                <Zap className="w-5 h-5 mr-2" />
                무료로 시작하기
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-white text-white hover:bg-white/10">
              <Users className="w-5 h-5 mr-2" />
              팀 초대하기
            </Button>
          </div>
          <p className="text-blue-100 text-sm mt-4">
            💳 신용카드 불필요 • ⚡ 30초 만에 시작 • 🔒 완전 무료
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo size="md" variant="white" />
                <span className="text-xl font-bold">Flowra</span>
              </div>
              <p className="text-gray-400 text-sm">
                팀워크의 새로운 시작, Flowra와 함께하세요.
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
    </div>
  );
}
