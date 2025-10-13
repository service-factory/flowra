'use client';

import React from 'react';
import { Brand } from '@/components/ui/brand';
import { ArrowRight, CheckCircle, Star, Zap } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
}

const CTASection = ({ onGetStarted }: CTASectionProps) => {
  const testimonials = [
    {
      name: "김개발자",
      role: "풀스택 개발자",
      content: "사이드 프로젝트 관리가 이렇게 쉬워도 되나요? 정말 게임체인저네요!",
      avatar: "👨‍💻"
    },
    {
      name: "이디자이너",
      role: "UI/UX 디자이너",
      content: "Discord에서 바로 업무 체크할 수 있어서 너무 편해요. 별도 앱 왔다갔다 안해도 돼서 좋습니다.",
      avatar: "🎨"
    },
    {
      name: "박매니저",
      role: "프로덕트 매니저",
      content: "팀 진행 상황을 한눈에 볼 수 있어서 PM으로서 정말 만족해요. 추천합니다!",
      avatar: "📊"
    }
  ];

  const quickStart = [
    { step: "1", text: "회원가입" },
    { step: "2", text: "팀 생성 & 초대" },
    { step: "3", text: "Discord 연동" },
    { step: "4", text: "첫 업무 생성" }
  ];

  return (
    <section className="py-32 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Testimonials */}
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            이미 <span className="text-blue-600">100+ 팀</span>이 경험한 변화
          </h2>
          <p className="text-xl text-gray-600 mb-16">
            실제 사용자들의 생생한 후기
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-10 bg-white rounded-3xl border border-gray-200 hover:border-blue-600/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-6 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-900 mb-8 leading-relaxed text-lg">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                <div className="flex items-center gap-4 justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main CTA */}
        <div className="bg-white rounded-3xl p-12 md:p-16 text-center border border-gray-200 max-w-5xl mx-auto mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            사이드 프로젝트 관리,
            <br />
            <span className="text-blue-600">더 이상 고민하지 마세요</span>
          </h2>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            4분이면 충분합니다. 지금 시작해서 팀의 변화를 직접 경험해보세요
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {quickStart.map((item, index) => (
              <div key={index} className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-lg font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <span className="font-semibold text-gray-900">{item.text}</span>
              </div>
            ))}
          </div>

          <div className="mb-10">
            <button
              type="button"
              onClick={onGetStarted}
              className="group bg-blue-600 text-white px-12 py-6 rounded-xl font-bold text-xl hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-3 shadow-xl hover:shadow-2xl"
            >
              <Zap className="w-6 h-6" />
              무료로 시작하기
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-8 text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>신용카드 필요 없음</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>무료로 사용 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span>팀원 무제한</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center border-t border-gray-200 pt-16">
          <div className="flex items-center justify-center mb-8">
            <Brand size="lg" layout="horizontal" weight="bold" />
          </div>

          <p className="text-gray-600 mb-8 text-lg">
            팀 업무와 일정이 조화롭게 흐르는 Flowra
          </p>

          <div className="flex items-center justify-center gap-8 text-gray-600 mb-8">
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">개인정보처리방침</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">이용약관</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">고객지원</a>
            <a href="#" className="hover:text-blue-600 transition-colors font-medium">문의하기</a>
          </div>

          <p className="text-gray-500">
            © 2024 Flowra. All rights reserved.
          </p>
        </footer>
      </div>
    </section>
  );
};

export default CTASection;
