import { createServiceClient } from '@/lib/supabase/server';
import type { Task, User, Team } from '@/types';

export interface DiscordWebhookConfig {
  webhookUrl: string;
  guildId: string;
  channelId: string;
}

export interface DiscordEmbed {
  title?: string;
  description?: string;
  color?: number;
  fields?: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
  footer?: {
    text: string;
    icon_url?: string;
  };
  timestamp?: string;
}

export interface DiscordMessage {
  content?: string;
  embeds?: DiscordEmbed[];
  username?: string;
  avatar_url?: string;
}

export class DiscordWebhookService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
  }

  /**
   * Discord 웹훅 메시지 발송
   */
  async sendWebhookMessage(webhookUrl: string, message: DiscordMessage): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error('Discord 웹훅 발송 실패:', response.status, response.statusText);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Discord 웹훅 발송 오류:', error);
      return false;
    }
  }

  /**
   * 팀 Discord 설정 조회
   */
  async getTeamConfig(teamId: string): Promise<DiscordWebhookConfig | null> {
    try {
      const { data, error } = await this.supabase
        .from('teams')
        .select('discord_guild_id, discord_channel_id')
        .eq('id', teamId)
        .single();

      if (error) {
        console.error('팀 Discord 설정 조회 실패:', error);
        return null;
      }

      if (!data?.discord_guild_id || !data?.discord_channel_id) {
        return null;
      }

      return {
        webhookUrl: '', // 더 이상 사용하지 않음
        guildId: data.discord_guild_id,
        channelId: data.discord_channel_id,
      };
    } catch (error) {
      console.error('팀 Discord 설정 조회 오류:', error);
      return null;
    }
  }

  /**
   * 팀 Discord 설정 저장
   */
  async setTeamConfig(teamId: string, config: DiscordWebhookConfig): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('teams')
        .update({
          discord_guild_id: config.guildId,
          discord_channel_id: config.channelId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', teamId);

      if (error) {
        console.error('팀 Discord 설정 저장 실패:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('팀 Discord 설정 저장 오류:', error);
      return false;
    }
  }


  /**
   * 마감일 알림 발송
   */
  async sendDueDateReminder(task: Task, assignee?: User): Promise<boolean> {
    try {
      const config = await this.getTeamConfig(task.team_id);
      if (!config) {
        console.error('Discord 설정을 찾을 수 없습니다.');
        return false;
      }

      const embed: DiscordEmbed = {
        title: '⏰ 마감일 알림',
        description: `**${task.title}** 업무의 마감일이 다가왔습니다.`,
        color: 0xff8800, // 주황색
        fields: [
          { name: '업무 제목', value: task.title, inline: true },
          { name: '마감일', value: task.due_date ? new Date(task.due_date).toLocaleDateString('ko-KR') : '미설정', inline: true },
          { name: '담당자', value: assignee?.name || '미지정', inline: true },
          { name: '우선순위', value: task.priority, inline: true },
          { name: '상태', value: task.status, inline: true },
        ],
        footer: {
          text: 'Flowra 업무 관리 시스템',
        },
        timestamp: new Date().toISOString(),
      };

      // 봇 방식으로 변경 예정 - 임시로 웹훅 메시지만 발송
      return await this.sendWebhookMessage(config.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('마감일 알림 발송 오류:', error);
      return false;
    }
  }

  /**
   * 업무 완료 알림 발송
   */
  async sendTaskCompletedNotification(task: Task, assignee?: User): Promise<boolean> {
    try {
      const config = await this.getTeamConfig(task.team_id);
      if (!config) {
        console.error('Discord 설정을 찾을 수 없습니다.');
        return false;
      }

      const embed: DiscordEmbed = {
        title: '🎉 업무 완료!',
        description: `**${task.title}** 업무가 완료되었습니다.`,
        color: 0x00ff00, // 초록색
        fields: [
          { name: '업무 제목', value: task.title, inline: true },
          { name: '완료자', value: assignee?.name || '미지정', inline: true },
          { name: '완료 시간', value: new Date().toLocaleString('ko-KR'), inline: true },
        ],
        footer: {
          text: 'Flowra 업무 관리 시스템',
        },
        timestamp: new Date().toISOString(),
      };

      return await this.sendWebhookMessage(config.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('업무 완료 알림 발송 오류:', error);
      return false;
    }
  }

  /**
   * 팀 멤버 가입 알림 발송
   */
  async sendTeamMemberJoinedNotification(team: Team, newMember: User): Promise<boolean> {
    try {
      const config = await this.getTeamConfig(team.id);
      if (!config) {
        console.error('Discord 설정을 찾을 수 없습니다.');
        return false;
      }

      const embed: DiscordEmbed = {
        title: '👋 새 팀원 환영!',
        description: `**${newMember.name}**님이 **${team.name}** 팀에 가입했습니다.`,
        color: 0x0099ff, // 파란색
        fields: [
          { name: '팀 이름', value: team.name, inline: true },
          { name: '새 멤버', value: newMember.name, inline: true },
          { name: '가입 시간', value: new Date().toLocaleString('ko-KR'), inline: true },
        ],
        footer: {
          text: 'Flowra 팀 관리 시스템',
        },
        timestamp: new Date().toISOString(),
      };

      return await this.sendWebhookMessage(config.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('팀 멤버 가입 알림 발송 오류:', error);
      return false;
    }
  }

  /**
   * 매일 아침 리마인드 발송
   */
  async sendDailyReminder(teamId: string, tasks: Task[], hasTasks: boolean): Promise<boolean> {
    try {
      const config = await this.getTeamConfig(teamId);
      if (!config) {
        console.error('Discord 설정을 찾을 수 없습니다.');
        return false;
      }

      let embed: DiscordEmbed;

      if (hasTasks && tasks.length > 0) {
        const taskList = tasks.map((task, index) => 
          `**${index + 1}.** ${task.title}`
        ).join('\n');

        embed = {
          title: '🌅 아침 리마인드 - 내일 마감 업무',
          description: `좋은 아침입니다! 내일 마감인 업무가 ${tasks.length}개 있습니다.\n\n${taskList}`,
          color: 0xff8800, // 주황색
          fields: [
            { name: '📅 날짜', value: new Date().toLocaleDateString('ko-KR'), inline: true },
            { name: '📋 업무 수', value: `${tasks.length}개`, inline: true },
          ],
          footer: {
            text: 'Flowra 리마인드 시스템',
          },
          timestamp: new Date().toISOString(),
        };
      } else {
        embed = {
          title: '🌅 아침 리마인드',
          description: `좋은 아침입니다! 오늘은 마감일이 있는 업무가 없습니다. 좋은 하루 되세요! 🌟`,
          color: 0x00ff88, // 연한 초록색
          fields: [
            { name: '📅 날짜', value: new Date().toLocaleDateString('ko-KR'), inline: true },
          ],
          footer: {
            text: 'Flowra 리마인드 시스템',
          },
          timestamp: new Date().toISOString(),
        };
      }

      return await this.sendWebhookMessage(config.webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('매일 리마인드 발송 오류:', error);
      return false;
    }
  }

  /**
   * 테스트 메시지 발송
   */
  async sendTestMessage(webhookUrl: string): Promise<boolean> {
    try {
      const embed: DiscordEmbed = {
        title: '🧪 Discord 웹훅 테스트',
        description: 'Discord 웹훅이 정상적으로 작동하고 있습니다!',
        color: 0x00ff00, // 초록색
        fields: [
          { name: '테스트 시간', value: new Date().toLocaleString('ko-KR'), inline: true },
          { name: '상태', value: '정상', inline: true },
        ],
        footer: {
          text: 'Flowra Discord 연동 테스트',
        },
        timestamp: new Date().toISOString(),
      };

      return await this.sendWebhookMessage(webhookUrl, { embeds: [embed] });
    } catch (error) {
      console.error('테스트 메시지 발송 오류:', error);
      return false;
    }
  }
}

// 싱글톤 인스턴스
export const discordWebhookService = new DiscordWebhookService();
