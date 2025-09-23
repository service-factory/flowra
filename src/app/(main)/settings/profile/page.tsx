'use client';

import { useState, useEffect } from 'react';
import { SettingsNavigation } from '../components/SettingsNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Calendar, Camera, Save, AlertCircle } from 'lucide-react';

export default function ProfileSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: (user as any).user_metadata?.full_name || '',
        email: user.email || '',
        bio: (user as any).user_metadata?.bio || '',
        avatar: (user as any).user_metadata?.avatar_url || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "프로필 저장 완료",
        description: "프로필이 성공적으로 저장되었습니다.",
      });
    } catch {
      toast({
        title: "저장 실패",
        description: "프로필 저장 중 오류가 발생했습니다.",
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
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            로그인이 필요합니다
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            프로필 설정을 위해 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <SettingsNavigation />
      
      <div className="flex-1 p-6">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              프로필 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              개인 정보를 관리하세요
            </p>
          </div>

          {/* Profile Form */}
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>기본 정보</span>
                </CardTitle>
                <CardDescription>
                  개인 정보를 입력하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={formData.avatar} />
                    <AvatarFallback>
                      {formData.name ? formData.name.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm" type="button">
                      <Camera className="h-4 w-4 mr-2" />
                      아바타 변경
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG 파일만 업로드 가능합니다
                    </p>
                  </div>
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="이름을 입력하세요"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="이메일을 입력하세요"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    이메일은 로그인 제공업체에서 관리됩니다
                  </p>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">소개</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="자신에 대해 간단히 소개해주세요"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>계정 정보</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>가입일</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR') : '알 수 없음'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>로그인 제공업체</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <Badge variant="outline">
                        {(user as any).app_metadata?.provider || 'Email'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
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
                    <span>저장</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}