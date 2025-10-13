'use client';

import React from 'react';
import { Calendar, Bell, BarChart3, MessageSquare, CheckCircle } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Calendar,
      title: "업무 생성",
      description: "앱이나 Discord에서 간편하게 업무를 생성하고 담당자를 배정하세요",
      items: [
        "직관적인 업무 생성",
        "담당자 자동 배정",
        "마감일 설정"
      ]
    },
    {
      icon: Bell,
      title: "자동 알림",
      description: "마감일 전날 담당자에게 자동으로 알림이 발송됩니다",
      items: [
        "마감일 전날 알림",
        "Discord 멘션",
        "앱 푸시 알림"
      ]
    },
    {
      icon: BarChart3,
      title: "진행 상황 확인",
      description: "대시보드에서 팀 전체 업무 상태를 한눈에 파악하세요",
      items: [
        "실시간 대시보드",
        "칸반 보드",
        "진행률 통계"
      ]
    },
    {
      icon: MessageSquare,
      title: "Discord 연동",
      description: "Discord에서 완료 체크 시 앱에서 자동으로 완료 처리됩니다",
      items: [
        "양방향 동기화",
        "완료 자동 처리",
        "팀 소통 통합"
      ]
    }
  ];

  return (
    <section id="features" className="py-32 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header - Toss Style */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            업무 관리,
            <br />
            <span className="text-blue-600">이제 자동으로 흐릅니다</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            복잡한 프로젝트 관리 도구는 이제 그만.
            <br />
            정말 필요한 기능들만 모아 사이드 프로젝트에 최적화했습니다.
          </p>
        </div>

        {/* Features Grid - Clean & Simple */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-20">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-10 bg-white rounded-3xl border border-gray-200 hover:border-blue-600/20 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                {feature.description}
              </p>

              <ul className="space-y-3">
                {feature.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Stats Section - Clean Numbers */}
        <div className="bg-white rounded-3xl p-12 border border-gray-200 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-3">4분</div>
              <div className="text-gray-900 font-semibold mb-2">빠른 시작</div>
              <p className="text-sm text-gray-600">팀 생성부터 첫 업무까지</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-3">90%</div>
              <div className="text-gray-900 font-semibold mb-2">마감 준수율</div>
              <p className="text-sm text-gray-600">자동 알림으로 일정 관리</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-3">100+</div>
              <div className="text-gray-900 font-semibold mb-2">팀이 사용 중</div>
              <p className="text-sm text-gray-600">사이드 프로젝트 팀들의 선택</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
