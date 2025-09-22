'use client';

import { SettingsNavigation } from './components/SettingsNavigation';
import { SettingsHeader } from './components/SettingsHeader';
import { AccountInfoCard } from './components/AccountInfoCard';
import { SettingsCategoriesGrid } from './components/SettingsCategoriesGrid';
import { useSettingsData } from './hooks/useSettingsData';
import { 
  SettingsLoadingSpinner,
  SettingsUnauthenticatedSkeleton
} from './components/SettingsLoadingSkeleton';

export default function SettingsPage() {
  const { state, settingsCategories, isAuthenticated, isUnauthenticated } = useSettingsData();

  if (state.isLoading) {
    return <SettingsLoadingSpinner />;
  }

  if (isUnauthenticated) {
    return <SettingsUnauthenticatedSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            설정 페이지에 접근하려면 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SettingsNavigation />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <SettingsHeader isLoading={state.isLoading} />

          <AccountInfoCard user={state.user} isLoading={state.isLoading} />

          <SettingsCategoriesGrid 
            categories={settingsCategories} 
            isLoading={state.isLoading} 
          />
        </div>
      </div>
    </div>
  );
}
