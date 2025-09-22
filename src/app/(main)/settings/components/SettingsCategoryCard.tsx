import { memo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsCategory } from '../types/settings';

interface SettingsCategoryCardProps {
  category: SettingsCategory;
}

export const SettingsCategoryCard = memo(function SettingsCategoryCard({
  category,
}: SettingsCategoryCardProps) {
  const IconComponent = category.icon;

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 cursor-pointer group">
      <Link href={category.href}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className={`p-3 ${category.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
              <IconComponent className={`h-6 w-6 ${category.iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{category.title}</CardTitle>
              <CardDescription>{category.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {category.description}
          </p>
          <div className={`flex items-center text-sm ${category.color} font-medium`}>
            설정하기
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
});
