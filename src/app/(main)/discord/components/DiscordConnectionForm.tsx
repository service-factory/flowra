import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Bot, RefreshCw, ExternalLink, AlertCircle } from "lucide-react";
import { ConnectionForm } from '../types/discord';
import { DiscordConnectionFormSkeleton } from './DiscordLoadingSkeleton';

interface DiscordConnectionFormProps {
  connectionForm: ConnectionForm;
  isLoading: boolean;
  onFormChange: (form: ConnectionForm) => void;
  onConnect: () => void;
  loading?: boolean;
}

export const DiscordConnectionForm = memo(function DiscordConnectionForm({
  connectionForm,
  isLoading,
  onFormChange,
  onConnect,
  loading = false,
}: DiscordConnectionFormProps) {
  if (loading) {
    return <DiscordConnectionFormSkeleton />;
  }

  const handleInputChange = (field: keyof ConnectionForm, value: string) => {
    onFormChange({
      ...connectionForm,
      [field]: value,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Discord 봇 연결
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Discord 봇을 연결하려면 다음 정보가 필요합니다:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Discord 서버 ID (Guild ID)</li>
              <li>텍스트 채널 ID</li>
            </ul>
            <a 
              href="https://discord.com/developers/applications" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-800"
            >
              Discord 개발자 포털에서 봇 생성하기
              <ExternalLink className="h-3 w-3" />
            </a>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <Label htmlFor="guildId">Discord 서버 ID</Label>
            <Input
              id="guildId"
              type="text"
              placeholder="서버 ID를 입력하세요"
              value={connectionForm.guildId}
              onChange={(e) => handleInputChange('guildId', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="channelId">채널 ID</Label>
            <Input
              id="channelId"
              type="text"
              placeholder="채널 ID를 입력하세요"
              value={connectionForm.channelId}
              onChange={(e) => handleInputChange('channelId', e.target.value)}
            />
          </div>

          <Button 
            onClick={onConnect}
            disabled={isLoading || !connectionForm.guildId || !connectionForm.channelId}
            className="w-full"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                연결 중...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Discord 봇 연결
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
