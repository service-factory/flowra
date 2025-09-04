import { create } from 'zustand';
import type { Task, TaskFilters, PaginationState } from '@/types';

interface TasksState {
  items: Task[];
  filters: TaskFilters;
  pagination: PaginationState;
  isLoading: boolean;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  setFilters: (filters: TaskFilters) => void;
  setPagination: (pagination: PaginationState) => void;
  setLoading: (loading: boolean) => void;
  clearTasks: () => void;
}

export const useTasksStore = create<TasksState>((set) => ({
  items: [],
  filters: {},
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  isLoading: false,

  setTasks: (items) => set({ items }),
  
  addTask: (task) => set((state) => ({ 
    items: [task, ...state.items] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    items: state.items.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    ),
  })),
  
  removeTask: (id) => set((state) => ({
    items: state.items.filter((task) => task.id !== id),
  })),
  
  setFilters: (filters) => set({ filters }),
  
  setPagination: (pagination) => set({ pagination }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  clearTasks: () => set({ 
    items: [], 
    filters: {}, 
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    }
  }),
}));
