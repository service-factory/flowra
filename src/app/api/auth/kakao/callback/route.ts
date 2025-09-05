import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    
    try {
      // OAuth 코드를 세션으로 교환
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Kakao OAuth callback error:', error);
        return NextResponse.redirect(`${origin}/error?message=인증_처리_중_오류가_발생했습니다`);
      }

      if (data.user && data.user.email) {
        // 사용자 정보를 users 테이블에 저장/업데이트
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'Unknown',
            avatar_url: data.user.user_metadata?.avatar_url,
            provider: 'kakao',
            provider_id: data.user.user_metadata?.provider_id || data.user.id,
            timezone: 'Asia/Seoul',
            email_verified: data.user.email_confirmed_at ? true : false,
            is_active: true,
            last_login_at: new Date().toISOString(),
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'email'
          });

        if (upsertError) {
          console.error('User upsert error:', upsertError);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    } catch (error) {
      console.error('Kakao callback error:', error);
      return NextResponse.redirect(`${origin}/error?message=로그인_처리_중_오류가_발생했습니다`);
    }
  }

  // 에러가 발생한 경우
  return NextResponse.redirect(`${origin}/error?message=인증_코드가_없습니다`);
}
