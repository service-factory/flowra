import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: 'light',
      notifications: [],

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      setTheme: (theme) => set({ theme }),
      
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
      
      addNotification: (notification) => set((state) => ({
        notifications: [notification, ...state.notifications],
      })),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
      
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        ),
      })),
      
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen 
      }),
    }
  )
);
