import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestTube, RefreshCw, Clock, Bell } from "lucide-react";
import { UserSettings } from '../types/discord';
import { getTimezoneOptions } from '../utils/discordUtils';
import { DiscordUserSettingsSkeleton } from './DiscordLoadingSkeleton';

interface DiscordUserSettingsProps {
  userSettings: UserSettings | null;
  isLoading: boolean;
  onSettingsChange: (settings: UserSettings) => void;
  onSave: () => void;
  loading?: boolean;
}

export const DiscordUserSettings = memo(function DiscordUserSettings({
  userSettings,
  isLoading,
  onSettingsChange,
  onSave,
  loading = false,
}: DiscordUserSettingsProps) {
  if (loading) {
    return <DiscordUserSettingsSkeleton />;
  }

  if (!userSettings) {
    return null;
  }

  const handleInputChange = (field: keyof UserSettings, value: string | boolean) => {
    onSettingsChange({
      ...userSettings,
      [field]: value,
    });
  };

  const timezoneOptions = getTimezoneOptions();

  // 1시간 단위 시간 옵션 생성 (00:00 ~ 23:00)
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return {
      value: `${hour}:00:00`,
      label: `${hour}:00`,
      display: `${hour}:00`
    };
  });

  // 현재 설정된 시간 찾기
  const currentTime = userSettings.reminder_time || '09:00:00';
  const currentTimeDisplay = currentTime.slice(0, 5); // HH:MM 형식

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <Bell className="h-5 w-5" />
          개인 리마인드 설정
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          매일 설정한 시간에 Discord로 업무 알림을 받을 수 있습니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="reminderTime" className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-purple-600" />
              리마인드 시간
            </Label>
            <Select
              value={currentTime}
              onValueChange={(value) => handleInputChange('reminder_time', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="알림 시간을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map((time) => (
                  <SelectItem key={time.value} value={time.value}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="font-mono">{time.display}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>현재 설정:</strong> 매일 <span className="font-mono font-semibold">{currentTimeDisplay}</span>에 
                할당된 업무를 Discord로 알려드립니다.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="timezone" className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-purple-600" />
              시간대
            </Label>
            <Select
              value={userSettings.timezone || 'Asia/Seoul'}
              onValueChange={(value) => handleInputChange('timezone', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="시간대를 선택하세요" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timezoneOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <input
              type="checkbox"
              id="reminderEnabled"
              checked={userSettings.reminder_enabled !== false}
              onChange={(e) => handleInputChange('reminder_enabled', e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <Label htmlFor="reminderEnabled" className="text-sm font-medium text-green-700 dark:text-green-300">
              리마인드 활성화
            </Label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            onClick={onSave}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2.5"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 mr-2" />
                설정 저장
              </>
            )}
          </Button>
        </div>
        </div>
      </CardContent>
    </Card>
  );
});
