import { createServiceClient } from '@/lib/supabase/server';

export interface DiscordUserSettings {
  user_id: string;
  reminder_time: string; // HH:MM 형식 (예: "09:00")
  timezone: string; // 예: "Asia/Seoul"
  reminder_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export class DiscordUserSettingsService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
  }

  /**
   * 사용자 Discord 설정 조회
   */
  async getUserSettings(userId: string): Promise<DiscordUserSettings | null> {
    try {
      const { data, error } = await this.supabase
        .from('discord_user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // 데이터 없음 오류
          return null;
        } else if (error.code === 'PGRST205') { // 테이블이 존재하지 않는 오류
          console.warn('Discord 사용자 설정 테이블이 아직 생성되지 않았습니다. 기본값을 반환합니다.');
          return null; // 기본값은 null로 처리
        } else {
          console.error('Discord 사용자 설정 조회 오류:', error);
          return null;
        }
      }

      return data;
    } catch (error) {
      console.error('Discord 사용자 설정 조회 오류:', error);
      return null;
    }
  }

  /**
   * 사용자 Discord 설정 저장/업데이트
   */
  async updateUserSettings(userId: string, settings: Partial<DiscordUserSettings>): Promise<DiscordUserSettings | null> {
    try {
      const now = new Date().toISOString();
      
      // 기존 설정이 있는지 확인
      const existingSettings = await this.getUserSettings(userId);
      
      let data, error;
      
      if (existingSettings) {
        // 기존 설정 업데이트
        const { data: updatedData, error: updateError } = await this.supabase
          .from('discord_user_settings')
          .update({
            ...settings,
            updated_at: now,
          })
          .eq('user_id', userId)
          .select()
          .single();
        
        data = updatedData;
        error = updateError;
      } else {
        // 새 설정 생성
        const { data: newData, error: insertError } = await this.supabase
          .from('discord_user_settings')
          .insert({
            user_id: userId,
            reminder_time: settings.reminder_time || '09:00',
            timezone: settings.timezone || 'Asia/Seoul',
            reminder_enabled: settings.reminder_enabled !== undefined ? settings.reminder_enabled : true,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single();
        
        data = newData;
        error = insertError;
      }

      if (error) {
        if (error.code === 'PGRST205') { // 테이블이 존재하지 않는 오류
          console.warn('Discord 사용자 설정 테이블이 아직 생성되지 않았습니다. 설정을 저장할 수 없습니다.');
        } else {
          console.error('Discord 사용자 설정 저장 오류:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('Discord 사용자 설정 저장 오류:', error);
      return null;
    }
  }

  /**
   * 특정 시간에 알림을 받을 사용자 목록 조회
   */
  async getUsersForReminderTime(reminderTime: string, timezone: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('discord_user_settings')
        .select('user_id')
        .eq('reminder_time', reminderTime)
        .eq('timezone', timezone)
        .eq('reminder_enabled', true);

      if (error) {
        console.error('리마인드 시간별 사용자 조회 오류:', error);
        return [];
      }

      return data?.map(user => user.user_id) || [];
    } catch (error) {
      console.error('리마인드 시간별 사용자 조회 오류:', error);
      return [];
    }
  }

  /**
   * 모든 활성화된 사용자 설정 조회
   */
  async getAllActiveSettings(): Promise<DiscordUserSettings[]> {
    try {
      const { data, error } = await this.supabase
        .from('discord_user_settings')
        .select('*')
        .eq('reminder_enabled', true);

      if (error) {
        console.error('활성 사용자 설정 조회 오류:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('활성 사용자 설정 조회 오류:', error);
      return [];
    }
  }

  /**
   * 사용자 설정 삭제
   */
  async deleteUserSettings(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('discord_user_settings')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Discord 사용자 설정 삭제 오류:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Discord 사용자 설정 삭제 오류:', error);
      return false;
    }
  }

  /**
   * 시간대별로 그룹화된 사용자 설정 조회
   */
  async getSettingsByTimezone(): Promise<Map<string, DiscordUserSettings[]>> {
    try {
      const settings = await this.getAllActiveSettings();
      const groupedSettings = new Map<string, DiscordUserSettings[]>();

      for (const setting of settings) {
        if (!groupedSettings.has(setting.timezone)) {
          groupedSettings.set(setting.timezone, []);
        }
        groupedSettings.get(setting.timezone)!.push(setting);
      }

      return groupedSettings;
    } catch (error) {
      console.error('시간대별 설정 조회 오류:', error);
      return new Map();
    }
  }
}

// 싱글톤 인스턴스
export const discordUserSettingsService = new DiscordUserSettingsService();
