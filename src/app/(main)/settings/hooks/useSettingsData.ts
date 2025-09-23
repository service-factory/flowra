import { useMemo } from 'react';
import useAuth from '@/hooks/useAuth';
import { SettingsPageState } from '../types/settings';
import { getSettingsCategories } from '../utils/settingsUtils';

export const useSettingsData = () => {
  const { user, isLoading: authLoading } = useAuth();

  const settingsCategories = useMemo(() => getSettingsCategories(), []);

  const state: SettingsPageState = {
    isLoading: Boolean(authLoading),
    user: user || null,
  };

  const isAuthenticated = Boolean(user);
  const isUnauthenticated = !authLoading && !user;

  return {
    state,
    settingsCategories,
    isAuthenticated,
    isUnauthenticated,
  };
};
