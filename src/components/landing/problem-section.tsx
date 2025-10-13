'use client';

import React from 'react';
import { Clock, MessageSquare, AlertCircle } from 'lucide-react';

const ProblemSection = () => {
  const problems = [
    {
      icon: Clock,
      title: "시간은 부족한데",
      description: "매번 일정을 확인하고 정리하는 시간만 몇 시간씩 소요됩니다",
      impact: "주당 2.5시간"
    },
    {
      icon: MessageSquare,
      title: "소통은 산발적이고",
      description: "Discord, 카톡, 노션에 흩어진 정보를 찾으려면 여러 앱을 뒤져야 합니다",
      impact: "73%의 팀이 겪는 문제"
    },
    {
      icon: AlertCircle,
      title: "진행 상황은 불투명해",
      description: "누가 뭘 하고 있는지, 언제까지 완료되는지 실시간으로 파악하기 어렵습니다",
      impact: "41% 마감일 미준수"
    }
  ];

  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            사이드 프로젝트 관리,
            <br />
            정말 이래도 되나요?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            많은 팀들이 겪고 있는 현실적인 문제들입니다
          </p>
        </div>

        {/* Problem Cards - Simple & Clear */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="p-10 bg-gray-50 rounded-3xl border border-gray-200 hover:border-gray-300 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <problem.icon className="w-8 h-8 text-gray-700" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {problem.title}
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                {problem.description}
              </p>

              <div className="inline-block bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold">
                {problem.impact}
              </div>
            </div>
          ))}
        </div>

        {/* Transition Message */}
        <div className="text-center mt-20">
          <div className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full font-semibold text-lg">
            하지만 해결책이 있습니다
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
