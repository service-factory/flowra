'use client';

import { useState, useEffect } from 'react';
import { SettingsNavigation } from '../components/SettingsNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, 
  Edit3,
  Save,
  AlertCircle,
  Crown,
  User
} from 'lucide-react';

interface TeamSettings {
  name: string;
  description: string;
  slug: string;
  color: string;
  icon: string;
}

const defaultSettings: TeamSettings = {
  name: '',
  description: '',
  slug: '',
  color: 'blue',
  icon: 'Building2'
};

export default function TeamSettingsPage() {
  const { user, isLoading: authLoading, teamMemberships, currentTeam } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<TeamSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentTeam) {
      setSettings({
        name: currentTeam.name || '',
        description: currentTeam.description || '',
        slug: currentTeam.slug || '',
        color: (currentTeam.settings as Record<string, unknown>)?.color as string || 'blue',
        icon: (currentTeam.settings as Record<string, unknown>)?.icon as string || 'Building2'
      });
    }
  }, [currentTeam]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setSettings(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to update team settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "팀 설정 저장 완료",
        description: "팀 설정이 성공적으로 저장되었습니다.",
      });
    } catch {
      toast({
        title: "저장 실패",
        description: "팀 설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            팀 설정을 위해 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            팀을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            먼저 팀에 가입하거나 팀을 생성해주세요.
          </p>
        </div>
      </div>
    );
  }

  // Get current user's role in the team
  const currentMembership = teamMemberships.find(m => m.team_id === currentTeam.id);
  const userRole = currentMembership?.role || 'viewer';
  const isAdmin = userRole === 'admin';

  return (
    <div className="flex">
      <SettingsNavigation />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              팀 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              팀 정보와 설정을 관리하세요
            </p>
          </div>

          {/* Team Overview */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>팀 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 bg-${settings.color}-100 dark:bg-${settings.color}-900/50 rounded-xl flex items-center justify-center`}>
                    <Building2 className={`h-8 w-8 text-${settings.color}-600 dark:text-${settings.color}-400`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {settings.name || currentTeam.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {settings.description || currentTeam.description || '설명이 없습니다'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="capitalize">
                        {userRole === 'admin' ? '관리자' : userRole === 'member' ? '멤버' : '뷰어'}
                      </Badge>
                      {isAdmin && (
                        <Badge variant="default" className="bg-blue-600">
                          <Crown className="h-3 w-3 mr-1" />
                          관리자
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Settings Form */}
          {isAdmin ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Edit3 className="h-5 w-5" />
                    <span>팀 정보 편집</span>
                  </CardTitle>
                  <CardDescription>
                    팀의 기본 정보를 수정할 수 있습니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">팀 이름</Label>
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={handleInputChange}
                        placeholder="팀 이름을 입력하세요"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slug">팀 슬러그</Label>
                      <Input
                        id="slug"
                        value={settings.slug}
                        onChange={handleInputChange}
                        placeholder="team-slug"
                        required
                      />
                      <p className="text-xs text-gray-500">
                        URL에서 사용될 고유 식별자입니다
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">팀 설명</Label>
                    <Textarea
                      id="description"
                      value={settings.description}
                      onChange={handleInputChange}
                      placeholder="팀에 대한 설명을 입력하세요"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">팀 색상</Label>
                      <select
                        id="color"
                        value={settings.color}
                        onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="blue">파란색</option>
                        <option value="green">초록색</option>
                        <option value="purple">보라색</option>
                        <option value="red">빨간색</option>
                        <option value="orange">주황색</option>
                        <option value="pink">분홍색</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon">팀 아이콘</Label>
                      <select
                        id="icon"
                        value={settings.icon}
                        onChange={(e) => setSettings(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Building2">빌딩</option>
                        <option value="Users">사용자들</option>
                        <option value="Briefcase">가방</option>
                        <option value="Target">타겟</option>
                        <option value="Rocket">로켓</option>
                        <option value="Heart">하트</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>저장 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>설정 저장</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  권한이 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  팀 설정을 변경하려면 관리자 권한이 필요합니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}