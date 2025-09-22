export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: 'kakao' | 'google' | 'unknown';
  provider_id: string;
  discord_id?: string;
  timezone: string;
  email_verified: boolean;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  bgColor: string;
  iconColor: string;
}

export interface AccountInfo {
  user: User;
  isLoading: boolean;
}

export interface SettingsPageState {
  isLoading: boolean;
  user: User | null;
}
