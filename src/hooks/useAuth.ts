'use client';

import { useEffect, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import type { User, Team, TeamMember } from '@/types';
import type { Session } from '@supabase/supabase-js';

const transformSupabaseUser = (session: Session): User => {
  return {
    id: session.user.id,
    email: session.user.email || '',
    name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'Unknown',
    avatar_url: session.user.user_metadata?.avatar_url,
    provider: (session.user.app_metadata?.provider as 'kakao' | 'google' | 'unknown') || 'unknown',
    provider_id: session.user.id,
    timezone: 'Asia/Seoul',
    email_verified: session.user.email_confirmed_at ? true : false,
    is_active: true,
    last_login_at: new Date().toISOString(),
    created_at: session.user.created_at,
    updated_at: new Date().toISOString(),
  };
};

const fetchSession = async () => {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

const fetchTeamMemberships = async (userId: string) => {
  const supabase = createClient();
  const { data: memberships, error } = await supabase
    .from('team_members')
    .select(`
      id,
      team_id,
      user_id,
      role,
      permissions,
      is_active,
      invited_by,
      invited_at,
      joined_at,
      created_at,
      updated_at,
      teams!inner (
        id,
        name,
        description,
        slug,
        owner_id,
        is_active
      )
    `)
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('teams.is_active', true)
    .limit(10);

  if (error) throw error;

  if (memberships && memberships.length > 0) {
    const teamMembers: TeamMember[] = memberships
      .filter(membership => membership.team_id && membership.teams)
      .map(membership => ({
        id: membership.id,
        team_id: membership.team_id!,
        user_id: membership.user_id!,
        role: membership.role as 'admin' | 'member' | 'viewer',
        permissions: (membership.permissions as Record<string, unknown>) || {},
        is_active: membership.is_active || false,
        invited_by: membership.invited_by || undefined,
        invited_at: membership.invited_at || '',
        joined_at: membership.joined_at || undefined,
        created_at: membership.created_at || '',
        updated_at: membership.updated_at || '',
      }));

    const firstTeam = memberships[0].teams as Team;
    return { teamMembers, currentTeam: firstTeam };
  }

  return { teamMembers: [], currentTeam: null };
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const queryClient = useQueryClient();
  const { 
    user, 
    isAuthenticated, 
    currentTeam, 
    teamMemberships, 
    hasTeam,
    setUser, 
    setCurrentTeam, 
    setTeamMemberships,
    logout
  } = useAuthStore();
  const supabase = createClient();

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: teamData, isLoading: teamLoading } = useQuery({
    queryKey: ['teamMemberships', user?.id],
    queryFn: () => fetchTeamMemberships(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
    onError: (error) => {
      console.error('로그아웃 실패:', error);
    },
  });

  useEffect(() => {
    if (sessionData) {
      setSession(sessionData);
      if (sessionData.user) {
        const appUser = transformSupabaseUser(sessionData);
        setUser(appUser);
      } else {
        setUser(null);
      }
    } else {
      setSession(null);
      setUser(null);
    }
  }, [sessionData, setUser]);

  useEffect(() => {
    if (teamData) {
      setTeamMemberships(teamData.teamMembers);
      setCurrentTeam(teamData.currentTeam);
    } else if (!teamLoading && user) {
      setTeamMemberships([]);
      setCurrentTeam(null);
    }
  }, [teamData, teamLoading, user, setTeamMemberships, setCurrentTeam]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          queryClient.setQueryData(['session'], session);
        } else {
          queryClient.setQueryData(['session'], null);
          logout();
        }
        
        queryClient.invalidateQueries({ queryKey: ['session'] });
        if (session?.user) {
          queryClient.invalidateQueries({ queryKey: ['teamMemberships', session.user.id] });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, queryClient, logout]);

  const refreshTeamData = useCallback(async () => {
    if (user?.id) {
      await queryClient.invalidateQueries({ queryKey: ['teamMemberships', user.id] });
    }
  }, [user?.id, queryClient]);

  const isLoading = sessionLoading || (user && teamLoading);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    currentTeam,
    teamMemberships,
    hasTeam,
    signOut: signOutMutation.mutate,
    refreshTeamData,
    isSigningOut: signOutMutation.isPending,
  };
}
