import { DiscordStatus } from '../types/discord';

export const getPermissionIcon = (permission: string) => {
  switch (permission) {
    case 'SendMessages':
      return '💬';
    case 'EmbedLinks':
      return '🔗';
    case 'ReadMessageHistory':
      return '📖';
    case 'AddReactions':
      return '👍';
    default:
      return '✅';
  }
};

export const getConnectionStatusText = (discordStatus: DiscordStatus | null) => {
  return discordStatus?.connected ? '연결됨' : '연결 안됨';
};

export const getGuildName = (discordStatus: DiscordStatus | null) => {
  return discordStatus?.guild?.name || '연결 안됨';
};

export const getChannelName = (discordStatus: DiscordStatus | null) => {
  return discordStatus?.channel ? `#${discordStatus.channel.name}` : '설정 안됨';
};

export const getTimezoneOptions = () => [
  { value: 'Asia/Seoul', label: '한국 표준시 (KST)' },
  { value: 'America/New_York', label: '동부 표준시 (EST)' },
  { value: 'America/Los_Angeles', label: '태평양 표준시 (PST)' },
  { value: 'Europe/London', label: '그리니치 표준시 (GMT)' },
  { value: 'Europe/Berlin', label: '중앙 유럽 표준시 (CET)' },
  { value: 'Asia/Tokyo', label: '일본 표준시 (JST)' },
  { value: 'Asia/Shanghai', label: '중국 표준시 (CST)' },
  { value: 'Australia/Sydney', label: '호주 동부 표준시 (AEST)' },
];

export const getBotTestTypes = () => [
  { value: 'reminder', label: '리마인드 알림' },
  { value: 'due_date', label: '마감일 알림' },
  { value: 'overdue', label: '연체 알림' },
  { value: 'completed', label: '완료 알림' },
];

export const formatBotTestResult = (result: any) => {
  return {
    success: result.success || false,
    message: result.message || '알 수 없는 오류가 발생했습니다.',
    taskId: result.task_id || result.taskId,
    channelId: result.channel_id,
    guildId: result.guild_id,
    hasButtons: result.has_buttons,
    botReady: result.bot_ready,
  };
};
