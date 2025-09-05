import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Supabase OAuth를 통한 구글 로그인 시작
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${request.nextUrl.origin}/api/auth/google/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL("/error?message=구글_로그인_실패", request.url)
      );
    }

    // OAuth URL로 리다이렉트
    if (data.url) {
      return NextResponse.redirect(data.url);
    }

    return NextResponse.redirect(
      new URL("/error?message=OAuth_URL을_생성할_수_없습니다", request.url)
    );
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.redirect(
      new URL("/error?message=로그인_처리_중_오류가_발생했습니다", request.url)
    );
  }
}
