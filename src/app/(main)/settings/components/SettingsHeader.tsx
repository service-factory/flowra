import { memo } from 'react';
import { SettingsHeaderSkeleton } from './SettingsLoadingSkeleton';

interface SettingsHeaderProps {
  isLoading?: boolean;
}

export const SettingsHeader = memo(function SettingsHeader({
  isLoading = false,
}: SettingsHeaderProps) {
  if (isLoading) {
    return <SettingsHeaderSkeleton />;
  }

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        설정
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-2">
        계정 및 앱 설정을 관리하여 Flowra를 개인화하세요
      </p>
    </div>
  );
});
