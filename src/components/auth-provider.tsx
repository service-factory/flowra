'use client';

import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // 전역적으로 인증 상태를 초기화
  useEffect(() => {
    // 인증 상태 초기화는 useAuth 훅에서 처리됨
  }, []);

  return <>{children}</>;
}
