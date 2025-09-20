"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamInviteModal } from "@/components/team-invite-modal";
import { TeamCreateModal } from "@/components/team-create-modal";
import { TeamGuard } from "@/components/team-guard";
import { useAuth } from "@/hooks/useAuth";
import { useTeamMembers, type InvitationData } from "@/hooks/useTeamMembers";
import { 
  Users,
  UserPlus,
  MoreHorizontal,
  Crown,
  Shield,
  Settings,
  X,
  Mail,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  UserX,
  Send,
  Edit3,
} from "lucide-react";

// Status colors for members
const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
    default:
      return "bg-gray-400";
  }
};

// Role display helpers
const getRoleDisplayName = (role: string) => {
  switch (role) {
    case 'admin':
      return '관리자';
    case 'member':
      return '멤버';
    case 'viewer':
      return '뷰어';
    default:
      return role;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'text-red-600 border-red-200 dark:text-red-400 dark:border-red-800';
    case 'member':
      return 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800';
    case 'viewer':
      return 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800';
    default:
      return 'text-gray-600 border-gray-200 dark:text-gray-400 dark:border-gray-800';
  }
};

export default function TeamPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  
  const { currentTeam, refreshTeamData } = useAuth();
  
  const actualTeamId = useMemo(() => {
    if (teamId === '0' || !teamId) {
      return currentTeam?.id || null;
    }
    return teamId;
  }, [teamId, currentTeam?.id]);

  // 팀원 관리 훅 사용
  const {
    teamMembersData,
    filteredMembers,
    roleStats,
    isLoading,
    error,
    selectedRole,
    isInviting,
    isRemoving,
    isCancelling,
    isResending,
    setSelectedRole,
    handleInviteMembers,
    handleRemoveMember,
    handleCancelInvitation,
    handleResendInvitation,
    handleRefresh,
  } = useTeamMembers(actualTeamId);

  // 팀원 초대 핸들러
  const onInviteMembers = async (invitations: InvitationData[]) => {
    const result = await handleInviteMembers(invitations);
    if (result.success) {
    setIsInviteModalOpen(false);
    } else {
      // 에러 처리 (토스트 메시지 등)
      console.error('초대 실패:', result.error);
    }
  };

  // 멤버 액션 핸들러들
  const onResendInvitation = async (invitationId: string) => {
    setActionLoading(`resend-${invitationId}`);
    const result = await handleResendInvitation(invitationId);
    if (!result.success) {
      console.error('재전송 실패:', result.error);
    }
    setActionLoading(null);
  };

  const onCancelInvitation = async (invitationId: string) => {
    setActionLoading(`cancel-${invitationId}`);
    const result = await handleCancelInvitation(invitationId);
    if (!result.success) {
      console.error('취소 실패:', result.error);
    }
    setActionLoading(null);
  };

  const onRemoveMember = async (memberId: string) => {
    if (!confirm('정말로 이 멤버를 팀에서 제거하시겠습니까?')) return;
    
    setActionLoading(`remove-${memberId}`);
    const result = await handleRemoveMember(memberId);
    if (!result.success) {
      console.error('제거 실패:', result.error);
    }
    setActionLoading(null);
  };


  // 로딩 상태
  if (isLoading) {
    return (
      <TeamGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">팀원 목록을 불러오는 중...</p>
          </div>
        </div>
      </TeamGuard>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <TeamGuard>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="max-w-md">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                데이터를 불러올 수 없습니다
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'}
              </p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 시도
              </Button>
            </CardContent>
          </Card>
        </div>
      </TeamGuard>
    );
  }

  return (
    <TeamGuard>
      <div>
        {/* 헤더 섹션 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            팀원 관리
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            팀원들의 정보를 확인하고 관리하세요.
          </p>
        </div>

        {/* 간단한 통계 정보 */}
          {teamMembersData && (
        <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400 mb-8">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
                <span>총 {teamMembersData?.stats?.totalMembers || 0}명</span>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="h-4 w-4" />
                <span>관리자 {teamMembersData?.stats?.adminCount || 0}명</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
                <span>활성 {teamMembersData?.stats?.activeMembers || 0}명</span>
              </div>
              {(teamMembersData?.stats?.pendingInvitations || 0) > 0 && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>대기 중 {teamMembersData?.stats?.pendingInvitations || 0}명</span>
          </div>
              )}
        </div>
          )}

        {/* 필터 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">역할별 필터:</span>
                {roleStats.map((role) => (
                <Button
                  key={role.value}
                  variant={selectedRole === role.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRole(role.value)}
                    className="transition-all duration-200"
                >
                    {role.value === 'all' ? (
                      <Users className="h-4 w-4 mr-1.5" />
                    ) : (
                  <Badge className={`mr-1.5 ${role.color}`}>
                    {role.count}
                  </Badge>
                    )}
                  {role.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-1.5" />
              팀 설정
            </Button>
              <Button size="sm" onClick={() => setIsInviteModalOpen(true)} disabled={isInviting}>
                {isInviting ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
              <UserPlus className="h-4 w-4 mr-1.5" />
                )}
              팀원 초대
            </Button>
          </div>
        </div>

        {/* 팀원 목록 */}
        <div>
          {(() => {
            if (filteredMembers?.length === 0 && !isLoading) {
              return (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">팀원이 없습니다.</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    팀원을 초대하여 협업을 시작하세요.
                  </p>
                </div>
              );
            }
            
            if (filteredMembers && filteredMembers.length > 0) {
              return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredMembers.map((member) => {
                    return (
                <Card key={member.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 relative">
                <CardContent className="p-4 relative">
                  {/* 초대 상태 태그 */}
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
                    {/* 프로필 아바타 */}
                    <div className="relative mb-3">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src={member.isInvitation ? '' : member.avatar || ''} />
                          <AvatarFallback className="text-sm font-semibold">
                            {member.isInvitation ? 
                              member.email[0].toUpperCase() : 
                              (member.name ? member.name[0].toUpperCase() : member.email[0].toUpperCase())
                            }
                        </AvatarFallback>
                      </Avatar>
                      {!member.isInvitation && (
                          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${getStatusColor('online')}`}></div>
                      )}
                    </div>
                    
                    {/* 이름과 역할 */}
                      <div className="mb-3">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 truncate max-w-full">
                        {member.isInvitation ? member.email : member.name}
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
                    
                    {/* 업무 통계 또는 초대 정보 */}
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
                    
                    {/* 액션 버튼들 */}
                    <div className="flex items-center space-x-1 w-full">
                      {member.isInvitation ? (
                        <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 h-7 px-2" 
                              title="재전송"
                              onClick={() => onResendInvitation(member.id)}
                              disabled={actionLoading === `resend-${member.id}` || isResending}
                            >
                              {actionLoading === `resend-${member.id}` ? (
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
                              disabled={actionLoading === `cancel-${member.id}` || isCancelling}
                            >
                              {actionLoading === `cancel-${member.id}` ? (
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
                              disabled={actionLoading === `remove-${member.id}` || isRemoving}
                            >
                              {actionLoading === `remove-${member.id}` ? (
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
                  })}
          </div>
              );
            }
            
            return null;
          })()}
        </div>
      </div>

      {/* 팀원 초대 모달 */}
      <TeamInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={onInviteMembers}
        teamId={actualTeamId || ''}
      />

      {/* Team Create Modal */}
      <TeamCreateModal 
        isOpen={isTeamCreateModalOpen} 
        onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async () => {
          await refreshTeamData();
          if (currentTeam) {
            window.location.href = `/team?teamId=${currentTeam.id}`;
          } else {
            window.location.href = '/team?teamId=0';
          }
        }}
      />
    </TeamGuard>
  );
}
