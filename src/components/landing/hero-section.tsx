'use client';

import React from 'react';
import { Brand } from '@/components/ui/brand';
import { ArrowRight, CheckCircle, Users, Zap } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-white">
      {/* Clean Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Brand size="lg" layout="horizontal" weight="bold" />
          <div className="flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              소개
            </a>
            <a href="#workflow" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              기능
            </a>
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200">
              시작하기
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content - Toss-inspired Clean Layout */}
      <div className="container mx-auto px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline - Direct & Impactful */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.15] text-gray-900">
            사이드 프로젝트를
            <br />
            <span className="text-blue-600">효율적으로</span>
            <br />
            관리하세요
          </h1>

          {/* Clear Value Proposition */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            업무 생성부터 완료까지, 자동 알림과 Discord 연동으로
          </p>
          <p className="text-xl md:text-2xl text-gray-900 font-semibold mb-12 max-w-3xl mx-auto">
            4분이면 시작할 수 있어요
          </p>

          {/* Single Strong CTA */}
          <div className="mb-4">
            <button className="group bg-blue-600 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all duration-200 inline-flex items-center gap-2 shadow-lg hover:shadow-xl">
              무료로 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-20">
            신용카드 없이 바로 시작 • 무료로 사용 가능
          </p>

          {/* Simple Feature Highlights - Toss style */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-8 border border-gray-200 rounded-3xl bg-white hover:border-blue-600/20 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <CheckCircle className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">체계적인 업무 관리</h3>
              <p className="text-gray-600 leading-relaxed">할 일부터 완료까지 한눈에 확인하고 관리하세요</p>
            </div>

            <div className="p-8 border border-gray-200 rounded-3xl bg-white hover:border-blue-600/20 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Discord 완벽 연동</h3>
              <p className="text-gray-600 leading-relaxed">기존 소통 방식을 그대로 활용하세요</p>
            </div>

            <div className="p-8 border border-gray-200 rounded-3xl bg-white hover:border-blue-600/20 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
                <Zap className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">자동 알림</h3>
              <p className="text-gray-600 leading-relaxed">놓치기 쉬운 일정을 스마트하게 관리</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce flex flex-col items-center text-gray-400">
          <span className="text-xs mb-2">스크롤해서 더 보기</span>
          <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;