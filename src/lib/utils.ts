import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 앱의 기본 URL을 가져옵니다
 * 환경변수 우선순위: NEXT_PUBLIC_APP_URL > VERCEL_URL > localhost
 */
export function getAppBaseUrl(): string {
  // 프로덕션 환경에서는 NEXT_PUBLIC_APP_URL 사용
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Vercel 환경에서는 VERCEL_URL 사용
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // 로컬 개발 환경
  return 'http://localhost:3000';
}
