'use client';

import React from 'react';
import { ArrowRight, Workflow, Users, Zap } from 'lucide-react';

const SolutionSection = () => {
  const workflow = [
    {
      step: "1",
      title: "업무 생성",
      description: "앱이나 Discord에서 간편하게 업무를 생성하고 담당자를 배정"
    },
    {
      step: "2",
      title: "자동 알림",
      description: "마감일 전날 담당자에게 자동으로 알림 발송"
    },
    {
      step: "3",
      title: "진행 확인",
      description: "대시보드에서 팀 전체 업무 상태를 한눈에 확인"
    },
    {
      step: "4",
      title: "완료 처리",
      description: "Discord에서 완료 체크 시 앱에서 자동으로 완료 처리"
    }
  ];

  return (
    <section id="workflow" className="py-32 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            <span className="text-blue-600">Flow + Aura</span> 컨셉으로
            <br />
            완벽한 조화를 만듭니다
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            업무의 자연스러운 흐름(Flow)과 팀워크의 조화로운 분위기(Aura)
          </p>
        </div>

        {/* Core Concepts - Side by Side */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-24">
          <div className="p-12 bg-white rounded-3xl border border-gray-200 hover:border-blue-600/20 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Workflow className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Flow</h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              업무가 자연스럽게 흐르도록
            </p>
            <p className="text-gray-700 leading-relaxed">
              업무 생성부터 완료까지, 모든 과정이 끊김 없이 연결되어 자동으로 관리됩니다. 스마트 알림으로 놓치는 일정이 없으며, 실시간 진행 상황이 자동으로 업데이트됩니다.
            </p>
          </div>

          <div className="p-12 bg-white rounded-3xl border border-gray-200 hover:border-blue-600/20 hover:shadow-xl transition-all duration-300">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Aura</h3>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              팀워크가 조화롭게 어우러지도록
            </p>
            <p className="text-gray-700 leading-relaxed">
              Discord 연동으로 기존 소통 방식을 그대로 활용하며, 투명한 업무 현황으로 신뢰를 구축합니다. 팀원별 역할과 진행 상황이 명확해집니다.
            </p>
          </div>
        </div>

        {/* Workflow Steps - Clean Timeline */}
        <div className="bg-white rounded-3xl p-12 border border-gray-200 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              4단계로 완성되는 <span className="text-blue-600">완벽한 워크플로우</span>
            </h3>
            <p className="text-gray-600 text-lg">
              복잡한 설정 없이, 바로 시작할 수 있는 직관적인 프로세스
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {workflow.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Connection Line */}
                {index < workflow.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] right-[-40%] h-0.5 bg-gray-200" />
                )}

                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                    {step.step}
                  </div>

                  <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="group bg-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
            <Zap className="w-5 h-5" />
            지금 바로 체험해보기
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
