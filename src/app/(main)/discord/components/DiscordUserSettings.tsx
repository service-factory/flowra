import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestTube, RefreshCw } from "lucide-react";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5 text-purple-600" />
          개인 리마인드 설정
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="reminderTime">리마인드 시간</Label>
            <Input
              id="reminderTime"
              type="time"
              value={userSettings.reminder_time || '09:00'}
              onChange={(e) => handleInputChange('reminder_time', e.target.value)}
            />
            <p className="text-sm text-gray-600 mt-1">
              매일 이 시간에 내일 마감인 업무를 Discord로 알려드립니다.
            </p>
          </div>

          <div>
            <Label htmlFor="timezone">시간대</Label>
            <select
              id="timezone"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userSettings.timezone || 'Asia/Seoul'}
              onChange={(e) => handleInputChange('timezone', e.target.value)}
            >
              {timezoneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="reminderEnabled"
              checked={userSettings.reminder_enabled !== false}
              onChange={(e) => handleInputChange('reminder_enabled', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="reminderEnabled">개인 리마인드 활성화</Label>
          </div>

          <Button 
            onClick={onSave}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                설정 저장
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
