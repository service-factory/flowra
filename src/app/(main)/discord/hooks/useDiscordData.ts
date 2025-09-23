import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { customFetch } from '@/lib/requests/customFetch';
import { 
  DiscordStatus, 
  UserSettings, 
  BotTestForm, 
  BotTestResult, 
  ConnectionForm 
} from '../types/discord';
import { formatBotTestResult } from '../utils/discordUtils';

export const useDiscordData = () => {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { currentTeam } = useAuth();
  
  // URL 파라미터의 teamId를 우선 사용, 없으면 currentTeam 사용
  const actualTeamId = teamId && teamId !== '0' ? teamId : currentTeam?.id;
  
  const [discordStatus, setDiscordStatus] = useState<DiscordStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [isBotTestLoading, setIsBotTestLoading] = useState(false);
  const [botTestResult, setBotTestResult] = useState<BotTestResult | null>(null);
  const [botTestForm, setBotTestForm] = useState<BotTestForm>({
    type: 'reminder',
    taskId: '',
  });
  const [connectionForm, setConnectionForm] = useState<ConnectionForm>({
    guildId: '',
    channelId: '',
  });

  const checkDiscordStatus = useCallback(async () => {
    if (!actualTeamId) return;

    setIsChecking(true);
    setError(null);

    try {
      await customFetch.getFetch({ url: '/api/discord/init' }).catch(console.error);
      
      const response = await customFetch.getFetch<{ data: DiscordStatus }, any>({
        url: `/api/discord/status?teamId=${actualTeamId}`,
      });

      if (response.data) {
        setDiscordStatus(response.data);
      }
    } catch (error) {
      console.error('Discord 상태 확인 오류:', error);
      setError('Discord 상태를 확인할 수 없습니다.');
    } finally {
      setIsChecking(false);
    }
  }, [actualTeamId]);

  const checkUserSettings = useCallback(async () => {
    try {
      const response = await customFetch.getFetch<{ data: any }, any>({
        url: '/api/discord/user-settings',
      });

      if (response.data) {
        setUserSettings(response.data);
      }
    } catch (error) {
      console.error('사용자 설정 확인 오류:', error);
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (!actualTeamId) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await customFetch.postFetch<any, any>({
        url: '/api/discord/connect',
        body: {
          team_id: actualTeamId,
          guild_id: connectionForm.guildId,
          channel_id: connectionForm.channelId,
        },
      });

      if (response.data) {
        setSuccess('Discord 봇이 성공적으로 연결되었습니다!');
        setConnectionForm({ guildId: '', channelId: '' });
        await checkDiscordStatus();
      }
    } catch (error: any) {
      console.error('Discord 연결 오류:', error);
      setError(error.message || 'Discord 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [actualTeamId, connectionForm, checkDiscordStatus]);

  const handleDisconnect = useCallback(async () => {
    if (!actualTeamId) return;

    if (!confirm('Discord 봇 연결을 해제하시겠습니까?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await customFetch.deleteFetch<any, any>({
        url: `/api/discord/status?teamId=${actualTeamId}`,
      });

      if (response.data) {
        setSuccess('Discord 봇 연결이 해제되었습니다.');
        setDiscordStatus(null);
      }
    } catch (error: any) {
      console.error('Discord 연결 해제 오류:', error);
      setError(error.message || 'Discord 연결 해제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [actualTeamId]);

  const handleSaveUserSettings = useCallback(async () => {
    if (!userSettings) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await customFetch.postFetch<any, any>({
        url: '/api/discord/user-settings',
        body: userSettings,
      });

      if (response.data) {
        setSuccess('개인 설정이 저장되었습니다.');
        await checkUserSettings();
      }
    } catch (error: any) {
      console.error('사용자 설정 저장 오류:', error);
      setError(error.message || '설정 저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [userSettings, checkUserSettings]);

  const handleBotTestNotification = useCallback(async () => {
    if (!currentTeam?.id) return;

    setIsBotTestLoading(true);
    setBotTestResult(null);
    setError(null);

    try {
      const response = await customFetch.postFetch<any, any>({
        url: '/api/discord/bot-with-buttons',
        body: {
          team_id: currentTeam.id,
          type: botTestForm.type,
          task_id: botTestForm.taskId || undefined,
        },
      });

      if (response.data) {
        const formattedResult = formatBotTestResult(response.data);
        setBotTestResult(formattedResult);
        setSuccess('Discord 봇 테스트 알림이 성공적으로 발송되었습니다!');
      }
    } catch (error: any) {
      console.error('Discord 봇 테스트 발송 오류:', error);
      setBotTestResult({
        success: false,
        message: error.message || 'Discord 봇 테스트 발송에 실패했습니다.',
      });
      setError(error.message || 'Discord 봇 테스트 발송에 실패했습니다.');
    } finally {
      setIsBotTestLoading(false);
    }
  }, [currentTeam?.id, botTestForm]);

  const clearMessages = useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  const isConnected = useMemo(() => Boolean(discordStatus?.connected), [discordStatus?.connected]);
  const isDisconnected = useMemo(() => !discordStatus?.connected, [discordStatus?.connected]);

  useEffect(() => {
    if (currentTeam?.id) {
      checkDiscordStatus();
      checkUserSettings();
    }
  }, [currentTeam?.id, checkDiscordStatus, checkUserSettings]);

  return {
    discordStatus,
    isLoading,
    isChecking,
    error,
    success,
    userSettings,
    isBotTestLoading,
    botTestResult,
    botTestForm,
    connectionForm,
    isConnected,
    isDisconnected,
    setUserSettings,
    setBotTestForm,
    setConnectionForm,
    checkDiscordStatus,
    handleConnect,
    handleDisconnect,
    handleSaveUserSettings,
    handleBotTestNotification,
    clearMessages,
  };
};
