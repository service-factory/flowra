import { memo } from 'react';
import { TeamMember } from '../types/team';
import { TeamMemberCard } from './TeamMemberCard';
import { TeamMembersGridSkeleton, TeamEmptyStateSkeleton } from './TeamLoadingSkeleton';

interface TeamMembersGridProps {
  members: TeamMember[];
  actionLoading: string | null;
  isResending: boolean;
  isCancelling: boolean;
  isRemoving: boolean;
  isLoading?: boolean;
  onResendInvitation: (invitationId: string) => void;
  onCancelInvitation: (invitationId: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export const TeamMembersGrid = memo(function TeamMembersGrid({
  members,
  actionLoading,
  isResending,
  isCancelling,
  isRemoving,
  isLoading = false,
  onResendInvitation,
  onCancelInvitation,
  onRemoveMember,
}: TeamMembersGridProps) {
  if (isLoading) {
    return <TeamMembersGridSkeleton />;
  }

  if (members.length === 0) {
    return <TeamEmptyStateSkeleton />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {members.map((member) => (
        <TeamMemberCard
          key={member.id}
          member={member}
          actionLoading={actionLoading}
          isResending={isResending}
          isCancelling={isCancelling}
          isRemoving={isRemoving}
          onResendInvitation={onResendInvitation}
          onCancelInvitation={onCancelInvitation}
          onRemoveMember={onRemoveMember}
        />
      ))}
    </div>
  );
});
