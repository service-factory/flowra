import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { User as UserType } from '../types/settings';
import { getUserInitials, getProviderDisplayName } from '../utils/settingsUtils';
import { AccountInfoSkeleton } from './SettingsLoadingSkeleton';

interface AccountInfoCardProps {
  user: UserType | null;
  isLoading?: boolean;
}

export const AccountInfoCard = memo(function AccountInfoCard({
  user,
  isLoading = false,
}: AccountInfoCardProps) {
  if (isLoading) {
    return <AccountInfoSkeleton />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>계정 정보</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
              {getUserInitials(user)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {user.name || '사용자'}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 capitalize">
                {getProviderDisplayName(user.provider)} 계정
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
