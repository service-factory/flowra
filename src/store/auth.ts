import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  provider: 'kakao' | 'google' | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setProvider: (provider: 'kakao' | 'google' | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      provider: null,

      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        provider: user?.provider || null 
      }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setProvider: (provider) => set({ provider }),
      
      logout: () => set({ 
        user: null, 
        isAuthenticated: false, 
        provider: null 
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        provider: state.provider 
      }),
    }
  )
);
