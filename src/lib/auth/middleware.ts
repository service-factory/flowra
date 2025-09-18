import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';

type SupabaseClient = ReturnType<typeof createClient>;

export interface AuthenticatedRequest extends NextRequest {
  user: Database['public']['Tables']['users']['Row'];
  supabase: Awaited<SupabaseClient>;
}

export interface AuthResult {
  success: boolean;
  user?: Database['public']['Tables']['users']['Row'];
  supabase?: Awaited<SupabaseClient>;
  error?: NextResponse;
}

export interface TeamAuthResult extends AuthResult {
  membership?: Database['public']['Tables']['team_members']['Row'];
}

// 기본 인증 확인
export async function authenticate(request: NextRequest): Promise<AuthResult> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        success: false,
        error: NextResponse.json({ error: '인증 토큰이 필요합니다' }, { status: 401 })
      };
    }

    const token = authHeader.substring(7);
    const supabase = await createClient();
    
    // 토큰 검증
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return {
        success: false,
        error: NextResponse.json({ error: '유효하지 않은 토큰입니다' }, { status: 401 })
      };
    }

    // 사용자 정보 조회 (캐싱 가능)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return {
        success: false,
        error: NextResponse.json({ error: '사용자 정보를 찾을 수 없습니다' }, { status: 404 })
      };
    }

    return {
      success: true,
      user: userData,
      supabase
    };
  } catch (error) {
    console.error('인증 오류:', error);
    return {
      success: false,
      error: NextResponse.json({ error: '인증 처리 중 오류가 발생했습니다' }, { status: 500 })
    };
  }
}

// 팀 권한 확인 포함 인증
export async function authenticateWithTeam(
  request: NextRequest, 
  teamId: string, 
  requiredPermissions?: string[]
): Promise<TeamAuthResult> {
  const authResult = await authenticate(request);
  
  if (!authResult.success) {
    return authResult;
  }

  try {
    const { user, supabase } = authResult;
    if (!supabase) {
      return {
        success: false,
        error: NextResponse.json({ error: '데이터베이스 연결 오류' }, { status: 500 })
      };
    }
    
    // 팀 멤버십 확인 (최적화된 쿼리)
    const { data: membership, error: membershipError } = await supabase
      .from('team_members')
      .select(`
        *,
        teams!inner(
          id,
          name,
          slug,
          settings
        )
      `)
      .eq('team_id', teamId)
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: NextResponse.json({ error: '팀에 대한 접근 권한이 없습니다' }, { status: 403 })
      };
    }

    // 특정 권한이 필요한 경우 확인
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(permission => 
        hasPermission(membership, permission)
      );
      
      if (!hasRequiredPermissions) {
        return {
          success: false,
          error: NextResponse.json({ error: '해당 작업을 수행할 권한이 없습니다' }, { status: 403 })
        };
      }
    }

    return {
      success: true,
      user,
      supabase,
      membership
    };
  } catch (error) {
    console.error('팀 권한 확인 오류:', error);
    return {
      success: false,
      error: NextResponse.json({ error: '권한 확인 중 오류가 발생했습니다' }, { status: 500 })
    };
  }
}

// 권한 레벨 확인
export function hasPermission(
  membership: Database['public']['Tables']['team_members']['Row'],
  permission: string
): boolean {
  const permissions = membership.permissions as Record<string, boolean>;
  return permissions?.[permission] === true || membership.role === 'admin';
}

// 에러 응답 생성
export function createErrorResponse(message: string, status: number = 500): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

// 성공 응답 생성
export function createSuccessResponse(data: unknown, message?: string): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message })
  });
}
