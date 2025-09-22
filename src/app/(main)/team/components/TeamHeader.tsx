import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Users,
  UserPlus,
  Crown,
  Shield,
  Settings,
  Clock,
  Loader2
} from "lucide-react";
import { TeamStats } from '../types/team';
import { TeamHeaderSkeleton, TeamStatsSkeleton } from './TeamLoadingSkeleton';

interface TeamHeaderProps {
  stats?: TeamStats;
  isInviting: boolean;
  isLoading?: boolean;
  onInviteClick: () => void;
  onSettingsClick: () => void;
}

export const TeamHeader = memo(function TeamHeader({
  stats,
  isInviting,
  isLoading = false,
  onInviteClick,
  onSettingsClick,
}: TeamHeaderProps) {
  if (isLoading) {
    return (
      <>
        <TeamHeaderSkeleton />
        <TeamStatsSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          팀원 관리
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          팀원들의 정보를 확인하고 관리하세요.
        </p>
      </div>

      {stats && (
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>총 {stats.totalMembers || 0}명</span>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4" />
            <span>관리자 {stats.adminCount || 0}명</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>활성 {stats.activeMembers || 0}명</span>
          </div>
          {(stats.pendingInvitations || 0) > 0 && (
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>대기 중 {stats.pendingInvitations || 0}명</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={onSettingsClick}>
            <Settings className="h-4 w-4 mr-1.5" />
            팀 설정
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={onInviteClick} disabled={isInviting}>
            {isInviting ? (
              <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-1.5" />
            )}
            팀원 초대
          </Button>
        </div>
      </div>
    </>
  );
});
