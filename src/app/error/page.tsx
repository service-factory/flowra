'use client';

import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || '알 수 없는 오류가 발생했습니다.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Logo size="xl" className="mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            오류가 발생했습니다
          </h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">오류 메시지</CardTitle>
            <CardDescription>
              {message.replace(/_/g, ' ')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button asChild className="flex-1">
                <Link href="/auth/login">
                  다시 로그인
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/">
                  홈으로 이동
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
