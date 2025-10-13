'use client';

import React from 'react';
import { MessageSquare, ArrowRight, CheckCircle, Hash, Bot, Bell } from 'lucide-react';

const DiscordSection = () => {
  const features = [
    {
      icon: Bot,
      title: "스마트 봇 명령어",
      description: "간단한 명령어로 업무 생성부터 상태 확인까지"
    },
    {
      icon: Bell,
      title: "실시간 알림",
      description: "마감일, 상태 변경, 완료 등 모든 업데이트를 즉시 알림"
    },
    {
      icon: CheckCircle,
      title: "양방향 동기화",
      description: "Discord와 앱 간 실시간 데이터 동기화"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            이미 사용하고 있는
            <br />
            <span className="text-blue-600">Discord가 곧 업무 관리 도구</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            새로운 도구를 배울 필요 없이, 지금 사용하고 있는 Discord에서
            <br />
            바로 프로젝트 관리를 시작하세요
          </p>
        </div>

        {/* Discord UI Mockup */}
        <div className="bg-[#36393f] rounded-3xl p-8 mb-16 border border-gray-800 max-w-5xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
            <div className="w-8 h-8 bg-[#5865F2] rounded-full flex items-center justify-center">
              <Hash className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">general</span>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                F
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#5865F2] font-semibold">Flowra Bot</span>
                  <span className="bg-[#5865F2] text-white text-xs px-2 py-0.5 rounded font-semibold">BOT</span>
                  <span className="text-gray-400 text-sm">오늘 오후 2:15</span>
                </div>
                <p className="text-white leading-relaxed">
                  📝 새로운 업무가 생성되었습니다: <span className="text-blue-400 font-semibold">&ldquo;모바일 UI 개선&rdquo;</span>
                  <br />
                  👤 담당자: @김디자이너
                  <br />
                  📅 마감일: 2024년 1월 20일
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                김
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-green-500 font-semibold">김디자이너</span>
                  <span className="text-gray-400 text-sm">오늘 오후 2:17</span>
                </div>
                <p className="text-white leading-relaxed">네, 확인했습니다! 금요일까지 완료하겠습니다 ✅</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                F
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-[#5865F2] font-semibold">Flowra Bot</span>
                  <span className="bg-[#5865F2] text-white text-xs px-2 py-0.5 rounded font-semibold">BOT</span>
                  <span className="text-gray-400 text-sm">오늘 오후 2:17</span>
                </div>
                <p className="text-white leading-relaxed">
                  ✨ 업무가 대시보드에 자동으로 추가되었습니다!
                  <br />
                  📊 프로젝트 진행률: 75% → 80%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-10 bg-gray-50 rounded-3xl border border-gray-200 hover:border-blue-600/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <feature.icon className="w-8 h-8 text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-10">
            왜 <span className="text-blue-600">Discord 연동</span>이 특별한가요?
          </h3>

          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {[
              "기존 소통 방식 그대로 활용",
              "별도 앱 학습 없이 바로 사용",
              "팀원들의 거부감 최소화",
              "자연스러운 워크플로우 통합"
            ].map((benefit, index) => (
              <div key={index} className="p-6 rounded-2xl bg-blue-50 border border-blue-100">
                <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-3" />
                <span className="font-semibold text-gray-900">{benefit}</span>
              </div>
            ))}
          </div>

          <button className="group bg-[#5865F2] text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-[#4752C4] transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
            <MessageSquare className="w-5 h-5" />
            Discord 연동 시작하기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DiscordSection;
