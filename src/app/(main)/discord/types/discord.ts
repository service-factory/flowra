export interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  memberCount?: number;
}

export interface DiscordChannel {
  id: string;
  name: string;
  type?: number;
}

export interface DiscordStatus {
  connected: boolean;
  guild?: DiscordGuild;
  channel?: DiscordChannel;
  botPermissions?: string[];
  message?: string;
}

export interface UserSettings {
  reminder_time: string;
  timezone: string;
  reminder_enabled: boolean;
}

export interface BotTestForm {
  type: 'reminder' | 'due_date' | 'overdue' | 'completed';
  taskId: string;
}

export interface BotTestResult {
  success: boolean;
  message: string;
  taskId?: string;
  channelId?: string;
  guildId?: string;
  hasButtons?: boolean;
  botReady?: boolean;
}

export interface ConnectionForm {
  guildId: string;
  channelId: string;
}

export interface DiscordPageState {
  discordStatus: DiscordStatus | null;
  isLoading: boolean;
  isChecking: boolean;
  error: string | null;
  success: string | null;
  userSettings: UserSettings | null;
  isBotTestLoading: boolean;
  botTestResult: BotTestResult | null;
  botTestForm: BotTestForm;
  connectionForm: ConnectionForm;
}
