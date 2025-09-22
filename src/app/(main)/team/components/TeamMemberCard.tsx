import { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Crown,
  Clock,
  Send,
  X,
  MoreHorizontal,
  Mail,
  Edit3,
  UserX,
  Loader2
} from "lucide-react";
import { TeamMember } from '../types/team';
import { getStatusColor, getRoleDisplayName, getRoleColor, getInitials, getDisplayName } from '../utils/teamUtils';

interface TeamMemberCardProps {
  member: TeamMember;
  actionLoading: string | null;
  isResending: boolean;
  isCancelling: boolean;
  isRemoving: boolean;
  onResendInvitation: (invitationId: string) => void;
  onCancelInvitation: (invitationId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const TeamMemberCard = memo(function TeamMemberCard({
  member,
  actionLoading,
  isResending,
  isCancelling,
  isRemoving,
  onResendInvitation,
  onCancelInvitation,
  onRemoveMember,
}: TeamMemberCardProps) {
  const isResendLoading = actionLoading === `resend-${member.id}`;
  const isCancelLoading = actionLoading === `cancel-${member.id}`;
  const isRemoveLoading = actionLoading === `remove-${member.id}`;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative">
      <CardContent className="p-4 relative">
        {member.isInvitation && (
          <div className="absolute top-[-0.75rem] right-2 z-10">
            <Badge 
              variant="outline" 
              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
            >
              <Clock className="h-3 w-3 mr-1" />
              초대중
            </Badge>
          </div>
        )}
          
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={member.isInvitation ? '' : member.avatar || ''} />
              <AvatarFallback className="text-sm font-semibold">
                {getInitials(member)}
              </AvatarFallback>
            </Avatar>
            {!member.isInvitation && (
              <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor('online')}`}></div>
            )}
          </div>
          
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate max-w-full">
              {getDisplayName(member)}
            </h3>
            {!member.isInvitation && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {member.email}
              </p>
            )}
            <div className="flex items-center justify-center space-x-1">
              {member.role === "admin" && (
                <Crown className="h-3 w-3 text-amber-500" />
              )}
              <Badge 
                variant="outline" 
                className={`text-xs px-1.5 py-0.5 ${getRoleColor(member.role)}`}
              >
                {getRoleDisplayName(member.role)}
              </Badge>
              {!member.isInvitation && !member.isActive && (
                <Badge variant="outline" className="text-xs px-1.5 py-0.5 text-gray-500 border-gray-300">
                  비활성
                </Badge>
              )}
            </div>
          </div>
          
          {member.isInvitation ? (
            <div className="w-full mb-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  초대 대기중
                </div>
                <div className="text-xs text-gray-400">
                  {member.invitedBy}님이 초대
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 w-full mb-3">
              <div className="text-center">
                <div className="text-sm font-bold text-green-600">{member.taskStats.completed}</div>
                <div className="text-xs text-gray-500">완료</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-blue-600">{member.taskStats.current}</div>
                <div className="text-xs text-gray-500">진행중</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-red-600">{member.taskStats.overdue}</div>
                <div className="text-xs text-gray-500">지연</div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-1 w-full">
            {member.isInvitation ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-7 px-2" 
                  title="재전송"
                  onClick={() => onResendInvitation(member.id)}
                  disabled={isResendLoading || isResending}
                >
                  {isResendLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-7 px-2" 
                  title="취소"
                  onClick={() => onCancelInvitation(member.id)}
                  disabled={isCancelLoading || isCancelling}
                >
                  {isCancelLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2" title="더보기">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 h-7 px-2" 
                  title="이메일 보내기"
                  onClick={() => window.open(`mailto:${member.email}`)}
                >
                  <Mail className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1 h-7 px-2" title="권한 변경">
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 px-2" 
                  title="멤버 제거"
                  onClick={() => onRemoveMember(member.id)}
                  disabled={isRemoveLoading || isRemoving}
                >
                  {isRemoveLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <UserX className="h-3 w-3" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
