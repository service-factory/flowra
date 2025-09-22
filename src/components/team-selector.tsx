"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Plus, 
  ArrowRight, 
  Crown, 
  UserCheck,
  Calendar
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { customFetch } from "@/lib/requests/customFetch";

interface Team {
  id: string;
  name: string;
  description?: string;
  member_count: number;
  role: 'owner' | 'admin' | 'member';
  created_at: string;
  updated_at: string;
}

interface TeamSelectorProps {
  onTeamSelect?: (teamId: string) => void;
  onTeamCreate?: () => void;
  onTeamJoin?: () => void;
  showCreateButton?: boolean;
  showJoinButton?: boolean;
  className?: string;
}

export function TeamSelector({
  onTeamSelect,
  onTeamCreate,
  onTeamJoin,
  showCreateButton = true,
  showJoinButton = true,
  className = ""
}: TeamSelectorProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchUserTeams();
  }, []);

  const fetchUserTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await customFetch.getFetch<{ data: Team[] }, any>({
        url: '/api/teams',
      });

      if (response.data) {
        setTeams(response.data);
        if (response.data.length === 1) {
          setSelectedTeamId(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('팀 목록 조회 오류:', error);
      setError('팀 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeamId(teamId);
    if (onTeamSelect) {
      onTeamSelect(teamId);
    } else {
      router.push(`/dashboard?teamId=${teamId}`);
    }
  };

  const handleCreateTeam = () => {
    if (onTeamCreate) {
      onTeamCreate();
    }
  };

  const handleJoinTeam = () => {
    if (onTeamJoin) {
      onTeamJoin();
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner':
        return '소유자';
      case 'admin':
        return '관리자';
      default:
        return '멤버';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center">
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchUserTeams} variant="outline">
          다시 시도
        </Button>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          아직 참여한 팀이 없습니다
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          팀을 만들거나 초대를 받아 시작해보세요
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showCreateButton && (
            <Button onClick={handleCreateTeam} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              팀 만들기
            </Button>
          )}
          {showJoinButton && (
            <Button onClick={handleJoinTeam} variant="outline" className="w-full sm:w-auto">
              <Users className="w-4 h-4 mr-2" />
              팀에 참여하기
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          팀을 선택해주세요
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          어떤 팀의 대시보드로 이동하시겠습니까?
        </p>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card 
            key={team.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTeamId === team.id 
                ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleTeamSelect(team.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/api/placeholder/48/48`} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold">
                      {team.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {team.name}
                      </h3>
                      <Badge variant="secondary" className={getRoleColor(team.role)}>
                        {getRoleIcon(team.role)}
                        <span className="ml-1">{getRoleText(team.role)}</span>
                      </Badge>
                    </div>
                    
                    {team.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {team.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{team.member_count}명</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(team.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedTeamId === team.id && (
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <span className="text-sm font-medium">선택됨</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
        {showCreateButton && (
          <Button onClick={handleCreateTeam} variant="outline" className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            새 팀 만들기
          </Button>
        )}
        {showJoinButton && (
          <Button onClick={handleJoinTeam} variant="outline" className="w-full sm:w-auto">
            <Users className="w-4 h-4 mr-2" />
            팀에 참여하기
          </Button>
        )}
      </div>
    </div>
  );
}
