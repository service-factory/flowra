import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Team, TeamMember } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  provider: 'kakao' | 'google' | 'unknown' | null;
  currentTeam: Team | null;
  teamMemberships: TeamMember[];
  hasTeam: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProvider: (provider: 'kakao' | 'google' | 'unknown' | null) => void;
  setCurrentTeam: (team: Team | null) => void;
  setTeamMemberships: (memberships: TeamMember[]) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      provider: null,
      currentTeam: null,
      teamMemberships: [],
      hasTeam: false,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        provider: user?.provider || null 
      }),
      
      setProvider: (provider) => set({ provider }),
      
      setCurrentTeam: (team) => set({ 
        currentTeam: team,
        hasTeam: !!team 
      }),
      
      setTeamMemberships: (memberships) => set({ 
        teamMemberships: memberships,
        hasTeam: memberships.length > 0 
      }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        provider: null,
        currentTeam: null,
        teamMemberships: [],
        hasTeam: false
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        provider: state.provider,
        currentTeam: state.currentTeam,
        teamMemberships: state.teamMemberships,
        hasTeam: state.hasTeam
      }),
    }
  )
);
