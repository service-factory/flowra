'use client';

import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import { useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleKakaoLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/api/auth/kakao/callback`,
        },
      });

      if (error) {
        console.error('Kakao login error:', error);
        alert('카카오 로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Kakao login error:', error);
      alert('카카오 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/google/callback`,
        },
      });

      if (error) {
        console.error('Google login error:', error);
        alert('구글 로그인 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Google login error:', error);
      alert('구글 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="xl" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Flowra에 로그인
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            팀과 함께 효율적으로 작업하세요
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>소셜 로그인</CardTitle>
            <CardDescription>
              카카오 또는 구글 계정으로 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              {isLoading ? '로그인 중...' : '카카오로 로그인'}
            </Button>
            
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? '로그인 중...' : '구글로 로그인'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
