import { memo } from 'react';
import { SettingsCategory } from '../types/settings';
import { SettingsCategoryCard } from './SettingsCategoryCard';
import { SettingsCategoriesSkeleton } from './SettingsLoadingSkeleton';

interface SettingsCategoriesGridProps {
  categories: SettingsCategory[];
  isLoading?: boolean;
}

export const SettingsCategoriesGrid = memo(function SettingsCategoriesGrid({
  categories,
  isLoading = false,
}: SettingsCategoriesGridProps) {
  if (isLoading) {
    return <SettingsCategoriesSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categories.map((category) => (
        <SettingsCategoryCard
          key={category.id}
          category={category}
        />
      ))}
    </div>
  );
});
