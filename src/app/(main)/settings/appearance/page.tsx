'use client';

import { useState, useEffect } from 'react';
import { SettingsNavigation } from '../components/SettingsNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { 
  Palette, 
  Moon, 
  Sun, 
  Monitor,
  Globe,
  AlertCircle
} from 'lucide-react';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timeFormat: '12h' | '24h';
  dateFormat: 'ko' | 'en';
  compactMode: boolean;
}

const defaultSettings: AppearanceSettings = {
  theme: 'system',
  language: 'ko',
  timeFormat: '24h',
  dateFormat: 'ko',
  compactMode: false
};

export default function AppearanceSettingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppearanceSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved settings
    setSettings(prev => ({ ...prev, theme: (theme as 'light' | 'dark' | 'system') || 'system' }));
  }, [theme]);

  const handleSettingChange = (key: keyof AppearanceSettings, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    if (key === 'theme') {
      setTheme(value as string);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to update appearance settings
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "외관 설정 저장 완료",
        description: "외관 설정이 성공적으로 저장되었습니다.",
      });
    } catch {
      toast({
        title: "저장 실패",
        description: "외관 설정 저장 중 오류가 발생했습니다.",
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
            외관 설정을 위해 로그인해주세요.
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
              외관 설정
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              테마와 디스플레이 설정을 관리하세요
            </p>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>테마</span>
                </CardTitle>
                <CardDescription>
                  앱의 테마를 선택하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      settings.theme === 'light' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleSettingChange('theme', 'light')}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Sun className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">라이트</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      밝은 테마
                    </p>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      settings.theme === 'dark' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleSettingChange('theme', 'dark')}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Moon className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">다크</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      어두운 테마
                    </p>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      settings.theme === 'system' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => handleSettingChange('theme', 'system')}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <Monitor className="h-5 w-5 text-gray-500" />
                      <span className="font-medium">시스템</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      시스템 설정 따름
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Language and Format Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>언어 및 형식</span>
                </CardTitle>
                <CardDescription>
                  언어와 날짜/시간 형식을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">언어</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) => handleSettingChange('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeFormat">시간 형식</Label>
                    <Select
                      value={settings.timeFormat}
                      onValueChange={(value) => handleSettingChange('timeFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12h">12시간 형식 (AM/PM)</SelectItem>
                        <SelectItem value="24h">24시간 형식</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">날짜 형식</Label>
                  <Select
                    value={settings.dateFormat}
                    onValueChange={(value) => handleSettingChange('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko">한국 형식 (YYYY년 MM월 DD일)</SelectItem>
                      <SelectItem value="en">영어 형식 (MM/DD/YYYY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5" />
                  <span>디스플레이</span>
                </CardTitle>
                <CardDescription>
                  화면 표시 옵션을 설정하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">컴팩트 모드</p>
                    <p className="text-sm text-gray-500">더 작은 간격으로 정보를 표시합니다</p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
                  />
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
                    <Palette className="h-4 w-4" />
                    <span>설정 저장</span>
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