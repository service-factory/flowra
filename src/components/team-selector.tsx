"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Crown,
  UserCheck,
  Calendar,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import useAuth from "@/hooks/useAuth";
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

const TeamSelector = ({
  onTeamSelect,
  onTeamCreate,
  onTeamJoin,
  showCreateButton = true,
  showJoinButton = true,
  className = ""
}: TeamSelectorProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [hoveredTeamId, setHoveredTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSelecting, setIsSelecting] = useState(false);
  const { } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchUserTeams();
  }, []);

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeams(teams);
    } else {
      const filtered = teams.filter(team =>
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeams(filtered);
    }
  }, [teams, searchQuery]);

  // 팀 선택 처리
  const handleTeamSelect = useCallback(async (teamId: string) => {
    if (isSelecting) return;

    setIsSelecting(true);
    setSelectedTeamId(teamId);

    // 시각적 피드백을 위한 약간의 딜레이
    await new Promise(resolve => setTimeout(resolve, 150));

    if (onTeamSelect) {
      onTeamSelect(teamId);
    } else {
      router.push(`/dashboard?teamId=${teamId}`);
    }

    setIsSelecting(false);
  }, [isSelecting, onTeamSelect, router]);

  // 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredTeams.length === 0) return;

      const currentIndex = selectedTeamId ? filteredTeams.findIndex(team => team.id === selectedTeamId) : -1;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          const nextIndex = currentIndex < filteredTeams.length - 1 ? currentIndex + 1 : 0;
          setSelectedTeamId(filteredTeams[nextIndex].id);
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredTeams.length - 1;
          setSelectedTeamId(filteredTeams[prevIndex].id);
          break;
        case 'Enter':
          if (selectedTeamId) {
            e.preventDefault();
            handleTeamSelect(selectedTeamId);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredTeams, selectedTeamId, handleTeamSelect]);

  const fetchUserTeams = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await customFetch.getFetch<{ data: Team[] }, any>({
        url: '/api/teams',
      });

      if (response.data) {
        setTeams(response.data);
        setFilteredTeams(response.data);
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
      <div className={`space-y-6 ${className}`}>
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-5 w-80 mx-auto" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <div className="flex space-x-4">
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-3.5 w-20" />
                  </div>
                </div>
                <Skeleton className="h-5 w-5" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          오류가 발생했습니다
        </h3>
        <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
        <Button onClick={fetchUserTeams} variant="outline" size="lg">
          <Clock className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          팀워크의 시작! 🚀
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
          아직 참여한 팀이 없습니다.<br/>
          <span className="font-medium text-blue-600 dark:text-blue-400">첫 번째 팀을 만들어</span> Flowra와 함께 성장해보세요!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showCreateButton && (
            <Button
              onClick={handleCreateTeam}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              새 팀 만들기
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          )}
          {showJoinButton && (
            <Button
              onClick={handleJoinTeam}
              variant="outline"
              className="w-full sm:w-auto border-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              size="lg"
            >
              <Users className="w-5 h-5 mr-2" />
              초대 코드로 참여
            </Button>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 max-w-md mx-auto">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mt-0.5">
              <AlertCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                💡 팁: 빠른 시작 가이드
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                팀을 만든 후 디스코드 연동하면 자동으로 업무 관리와 알림을 받을 수 있어요!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            어떤 팀으로 갈까요? 🎯
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            대시보드로 이동할 팀을 선택해주세요
          </p>
        </div>

        {/* 검색 입력 */}
        {teams.length > 3 && (
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="팀 이름으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white dark:bg-gray-900 border-2 focus:border-blue-500 transition-colors"
            />
          </div>
        )}
      </div>

      {/* 검색 결과가 없을 때 */}
      {searchQuery && filteredTeams.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {`'${searchQuery}'에 대한 팀을 찾을 수 없어요`}
          </p>
          <Button
            variant="ghost"
            onClick={() => setSearchQuery('')}
            className="mt-3"
          >
            검색 초기화
          </Button>
        </div>
      )}

      {/* 팀 목록 */}
      <div className="grid gap-3">
        {filteredTeams.map((team) => (
          <Card
            key={team.id}
            className={`group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
              selectedTeamId === team.id
                ? 'ring-2 ring-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg'
                : hoveredTeamId === team.id
                  ? 'shadow-lg bg-gray-50 dark:bg-gray-800/50'
                  : 'hover:shadow-md bg-white dark:bg-gray-800'
            }`}
            onClick={() => handleTeamSelect(team.id)}
            onMouseEnter={() => setHoveredTeamId(team.id)}
            onMouseLeave={() => setHoveredTeamId(null)}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative">
                    <Avatar className={`w-12 h-12 transition-all duration-200 ${
                      selectedTeamId === team.id ? 'ring-2 ring-blue-400 scale-110' : ''
                    }`}>
                      <AvatarImage src={`/api/placeholder/48/48`} />
                      <AvatarFallback className={`font-bold text-lg ${
                        selectedTeamId === team.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                      }`}>
                        {team.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {selectedTeamId === team.id && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className={`text-lg font-bold transition-colors ${
                        selectedTeamId === team.id
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300'
                      }`}>
                        {team.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`${getRoleColor(team.role)} px-2 py-1 text-xs font-medium transition-all ${
                          selectedTeamId === team.id ? 'shadow-sm' : ''
                        }`}
                      >
                        {getRoleIcon(team.role)}
                        <span className="ml-1.5">{getRoleText(team.role)}</span>
                      </Badge>
                    </div>

                    {team.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2 max-w-[400px]">
                        {team.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1.5">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{team.member_count}명</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(team.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {selectedTeamId === team.id ? (
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      {isSelecting ? (
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">이동 중...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span className="text-sm font-medium">선택됨</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`transition-all duration-200 ${
                      hoveredTeamId === team.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                    }`}>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 하단 액션 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
        {showCreateButton && (
          <Button
            onClick={handleCreateTeam}
            variant="outline"
            className="w-full sm:w-auto border-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            새 팀 만들기
          </Button>
        )}
        {showJoinButton && (
          <Button
            onClick={handleJoinTeam}
            variant="outline"
            className="w-full sm:w-auto border-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 transition-all duration-200"
            size="lg"
          >
            <Users className="w-5 h-5 mr-2" />
            초대 코드로 참여
          </Button>
        )}
      </div>

      {/* 키보드 네비게이션 힌트 */}
      {filteredTeams.length > 0 && (
        <div className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
          💡 <span className="font-medium">팁:</span> ↑↓ 화살표로 탐색, Enter로 선택할 수 있어요
        </div>
      )}
    </div>
  );
};

export default TeamSelector;