import { NextRequest } from 'next/server';
import { authenticate, createErrorResponse, createSuccessResponse } from '@/lib/auth/middleware';
import { z } from 'zod';

// 팀 생성 요청 스키마
const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  slug: z.string().min(3).max(30).regex(/^[a-z0-9-]+$/),
  timezone: z.string().default('Asia/Seoul'),
  language: z.string().default('ko'),
  visibility: z.enum(['private', 'public']).default('private'),
  color: z.string().default('blue'),
  icon: z.string().optional(),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    discord: z.boolean().default(false),
  }).optional(),
  workingHours: z.object({
    start: z.string().default('09:00'),
    end: z.string().default('18:00'),
    timezone: z.string().default('Asia/Seoul'),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 요청 데이터 파싱 및 검증
    const body = await request.json();
    const validationResult = createTeamSchema.safeParse(body);
    
    if (!validationResult.success) {
      return createErrorResponse('입력 데이터가 올바르지 않습니다', 400);
    }

    const validatedData = validationResult.data;

    // 슬러그 중복 확인
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('slug', validatedData.slug)
      .single();

    if (existingTeam) {
      return createErrorResponse('이미 사용 중인 팀 URL입니다', 400);
    }

    // 팀 설정 객체 생성
    const teamSettings = {
      timezone: validatedData.timezone,
      language: validatedData.language,
      visibility: validatedData.visibility,
      color: validatedData.color,
      icon: validatedData.icon,
      notificationSettings: validatedData.notificationSettings || {
        email: true,
        push: true,
        discord: false,
      },
      workingHours: validatedData.workingHours || {
        start: '09:00',
        end: '18:00',
        timezone: 'Asia/Seoul',
      },
    };

    // 최적화된 팀 생성 (필수 필드만 선택)
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: validatedData.name,
        description: validatedData.description,
        slug: validatedData.slug,
        owner_id: user!.id,
        settings: teamSettings,
      })
      .select('id, name, slug, created_at')
      .single();

    if (teamError) {
      console.error('팀 생성 실패:', teamError);
      return createErrorResponse('팀 생성에 실패했습니다', 500);
    }

    // 팀 소유자를 팀 멤버로 추가
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user!.id,
        role: 'admin',
        permissions: {
          can_manage_team: true,
          can_manage_members: true,
          can_manage_projects: true,
          can_manage_tasks: true,
          can_view_analytics: true,
        },
        joined_at: new Date().toISOString(),
      });

    if (memberError) {
      console.error('팀 멤버 추가 실패:', memberError);
      // 롤백: 팀 삭제
      await supabase.from('teams').delete().eq('id', team.id);
      return createErrorResponse('팀 멤버 추가에 실패했습니다', 500);
    }

    // 비동기로 기본 데이터 생성 (성능 최적화)
    const additionalTasks = [];

    // 기본 프로젝트 생성
    additionalTasks.push(
      supabase
        .from('projects')
        .insert({
          team_id: team.id,
          name: '기본 프로젝트',
          description: '팀의 첫 번째 프로젝트입니다',
          color: '#3B82F6',
          icon: 'folder',
          created_by: user.id,
        })
        .then(({ error }) => {
          if (error) console.warn('기본 프로젝트 생성 실패:', error);
        })
    );

    // 기본 팀 태그 생성
    const defaultTags = [
      { name: '긴급', color: '#F43F5E', description: '긴급한 업무' },
      { name: '중요', color: '#F59E0B', description: '중요한 업무' },
      { name: '개발', color: '#3B82F6', description: '개발 관련 업무' },
      { name: '디자인', color: '#8B5CF6', description: '디자인 관련 업무' },
      { name: '테스트', color: '#10B981', description: '테스트 관련 업무' },
    ];

    additionalTasks.push(
      supabase
        .from('team_tags')
        .insert(
          defaultTags.map(tag => ({
            team_id: team.id,
            name: tag.name,
            color: tag.color,
            description: tag.description,
            created_by: user.id,
          }))
        )
        .then(({ error }) => {
          if (error) console.warn('기본 태그 생성 실패:', error);
        })
    );

    // 모든 추가 작업들을 병렬로 실행 (응답 시간 단축)
    Promise.all(additionalTasks).catch(error => {
      console.error('추가 작업 처리 중 오류:', error);
    });

    return createSuccessResponse({
      id: team.id,
      name: team.name,
      slug: team.slug,
      created_at: team.created_at,
    }, '팀이 성공적으로 생성되었습니다');

  } catch (error) {
    console.error('팀 생성 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}

// 팀 목록 조회 (N+1 쿼리 문제 해결)
export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const authResult = await authenticate(request);
    if (!authResult.success) {
      return authResult.error!;
    }

    const { user, supabase } = authResult;
    if (!supabase || !user) {
      return createErrorResponse('인증 정보 또는 데이터베이스 연결 오류', 500);
    }

    // 단일 쿼리로 팀과 프로젝트 정보 모두 조회 (N+1 문제 해결)
    const { data: teamMemberships, error: teamsError } = await supabase
      .from('team_members')
      .select(`
        role,
        joined_at,
        teams!inner (
          id,
          name,
          description,
          slug,
          created_at,
          projects (
            id,
            name,
            color,
            created_at
          )
        )
      `)
      .eq('user_id', user!.id)
      .eq('is_active', true)
      .order('joined_at', { ascending: false });

    if (teamsError) {
      console.error('팀 목록 조회 실패:', teamsError);
      return createErrorResponse('팀 목록을 불러올 수 없습니다', 500);
    }

    // 데이터 구조 최적화
    const optimizedTeams = (teamMemberships || []).map(membership => ({
      id: membership.teams.id,
      name: membership.teams.name,
      description: membership.teams.description,
      slug: membership.teams.slug,
      role: membership.role,
      joined_at: membership.joined_at,
      created_at: membership.teams.created_at,
      project_count: membership.teams.projects?.length || 0,
      recent_projects: (membership.teams.projects || [])
        .slice(0, 3) // 최근 3개만
        .map(p => ({
          id: p.id,
          name: p.name,
          color: p.color
        }))
    }));

    return createSuccessResponse(optimizedTeams);

  } catch (error) {
    console.error('팀 목록 조회 API 오류:', error);
    return createErrorResponse('서버 오류가 발생했습니다', 500);
  }
}
