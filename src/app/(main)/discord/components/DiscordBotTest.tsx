import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, RefreshCw, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { BotTestForm, BotTestResult } from '../types/discord';
import { getBotTestTypes } from '../utils/discordUtils';
import { DiscordBotTestSkeleton } from './DiscordLoadingSkeleton';

interface DiscordBotTestProps {
  botTestForm: BotTestForm;
  botTestResult: BotTestResult | null;
  isBotTestLoading: boolean;
  onFormChange: (form: BotTestForm) => void;
  onTest: () => void;
  loading?: boolean;
}

export const DiscordBotTest = memo(function DiscordBotTest({
  botTestForm,
  botTestResult,
  isBotTestLoading,
  onFormChange,
  onTest,
  loading = false,
}: DiscordBotTestProps) {
  if (loading) {
    return <DiscordBotTestSkeleton />;
  }

  const handleInputChange = (field: keyof BotTestForm, value: string) => {
    onFormChange({
      ...botTestForm,
      [field]: value,
    });
  };

  const botTestTypes = getBotTestTypes();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-blue-600" />
          Discord 봇 테스트 (실제 버튼)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Discord 봇이 설정된 경우 실제 인터랙티브 버튼이 포함된 알림을 테스트할 수 있습니다.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div>
            <Label htmlFor="botTestType">알림 유형</Label>
            <Select 
              value={botTestForm.type} 
              onValueChange={(value) => handleInputChange('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="알림 유형 선택" />
              </SelectTrigger>
              <SelectContent>
                {botTestTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="botTestTaskId">업무 ID (선택사항)</Label>
            <Input
              id="botTestTaskId"
              type="text"
              placeholder="테스트할 업무 ID를 입력하세요"
              value={botTestForm.taskId}
              onChange={(e) => handleInputChange('taskId', e.target.value)}
            />
          </div>

          <Button 
            onClick={onTest}
            disabled={isBotTestLoading || !botTestForm.type}
            className="w-full"
          >
            {isBotTestLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                봇 테스트 중...
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                Discord 봇 테스트 발송
              </>
            )}
          </Button>
        </div>

        {botTestResult && (
          <div className="mt-6 space-y-4">
            <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
              botTestResult.success 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  botTestResult.success 
                    ? 'bg-green-100 dark:bg-green-900/40' 
                    : 'bg-red-100 dark:bg-red-900/40'
                }`}>
                  {botTestResult.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-lg mb-1">
                    {botTestResult.success ? '🎉 테스트 성공!' : '❌ 테스트 실패'}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {botTestResult.message}
                  </p>
                  
                  {botTestResult.success && (
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="font-medium text-gray-500 dark:text-gray-400">업무 ID</span>
                        <p className="font-mono text-gray-900 dark:text-white">{botTestResult.taskId}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="font-medium text-gray-500 dark:text-gray-400">채널 ID</span>
                        <p className="font-mono text-gray-900 dark:text-white">{botTestResult.channelId}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="font-medium text-gray-500 dark:text-gray-400">서버 ID</span>
                        <p className="font-mono text-gray-900 dark:text-white">{botTestResult.guildId}</p>
                      </div>
                      <div className="bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg">
                        <span className="font-medium text-gray-500 dark:text-gray-400">봇 상태</span>
                        <p className="flex items-center gap-1">
                          {botTestResult.botReady ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              온라인
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              오프라인
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
                <span className="group-open:rotate-90 transition-transform">▶</span>
                고급 디버깅 정보 보기
              </summary>
              <div className="mt-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify(botTestResult, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
