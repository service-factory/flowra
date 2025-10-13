'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Logo } from '@/components/ui/logo';
import { KakaoLogo } from '@/components/ui/kakao-logo';
import { GoogleLogo } from '@/components/ui/google-logo';
import { X, Sparkles, Zap, Users, Shield, Clock } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'kakao' | 'google') => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);

      // 현재 환경의 origin을 사용하여 올바른 리다이렉트 URL 생성
      const origin = window.location.origin;
      const redirectUrl = `${origin}/?autoProcess=true`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        alert(`${provider === 'kakao' ? '카카오' : '구글'} 로그인 중 오류가 발생했습니다.`);
        setIsLoading(false);
        setLoadingProvider(null);
      } else {
        // OAuth 로그인 성공 시 콜백 호출 (페이지 새로고침으로 인해 실제로는 호출되지 않을 수 있음)
        onLoginSuccess?.();
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      alert(`${provider === 'kakao' ? '카카오' : '구글'} 로그인 중 오류가 발생했습니다.`);
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden [&>button]:hidden">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="xl" variant="white" className="drop-shadow-lg" />
            </div>
            <DialogTitle className="text-2xl font-bold mb-2">
              Flowra에 오신 것을 환영합니다! 🎉
            </DialogTitle>
            <DialogDescription className="text-blue-100 text-base">
              팀워크의 새로운 시작, 지금 바로 시작해보세요
            </DialogDescription>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Features */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                <span>30초 만에 시작</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Shield className="w-4 h-4 text-green-500 mr-2" />
                <span>완전 무료</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-4 h-4 text-blue-500 mr-2" />
                <span>팀 초대 무제한</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 text-purple-500 mr-2" />
                <span>실시간 동기화</span>
              </div>
            </div>
          </div>

          {/* Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => handleOAuthLogin('kakao')}
              disabled={isLoading}
              className="w-full h-12 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loadingProvider === 'kakao' ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <KakaoLogo size={20} className="mr-3" />
                  카카오로 계속하기
                </div>
              )}
            </Button>

            <Button
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:border-gray-400 font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loadingProvider === 'google' ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                  로그인 중...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <GoogleLogo size={20} className="mr-3" />
                  구글로 계속하기
                </div>
              )}
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              로그인하면 <span className="font-semibold text-blue-600">이용약관</span> 및{' '}
              <span className="font-semibold text-blue-600">개인정보처리방침</span>에 동의하는 것으로 간주됩니다.
            </p>
            <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
              <Sparkles className="w-3 h-3 mr-1" />
              <span>사이드 프로젝트 팀을 위한 특별한 솔루션</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
