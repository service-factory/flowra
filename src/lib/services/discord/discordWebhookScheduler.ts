import { createServiceClient } from '@/lib/supabase/server';
import { discordUserSettingsService } from './discordUserSettings';
import { getDiscordBotService } from './discordBotService';
// import type { Task } from '@/types';

/**
 * Discord 웹훅 스케줄러
 * 매일 아침 리마인드와 정기적인 업무 알림을 처리합니다.
 */
export class DiscordWebhookScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private reminderIntervalId: NodeJS.Timeout | null = null;
  private supabase;
  private lastReminderDate: string = ''; // 마지막 알림을 보낸 날짜 추적

  constructor() {
    this.supabase = createServiceClient();
  }

  /**
   * 스케줄러 시작
   */
  start() {
    if (this.intervalId || this.reminderIntervalId) {
      return;
    }

    // 5분마다 리마인드 체크 (사용자 설정 시간대)
    this.reminderIntervalId = setInterval(async () => {
      await this.checkAndSendReminders();
    }, 5 * 60 * 1000); // 5분마다 체크

    // 30분마다 연체 업무 체크
    this.intervalId = setInterval(() => {
      this.runScheduledTasks();
    }, 30 * 60 * 1000);

    // 스케줄러만 시작하고 즉시 실행하지 않음
    // 실제 알림은 설정된 시간에만 발송됨
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.reminderIntervalId) {
      clearInterval(this.reminderIntervalId);
      this.reminderIntervalId = null;
    }
  }

  /**
   * 외부 트리거용: 리마인더 한 번 실행
   */
  public async tickReminders(): Promise<void> {
    await this.checkAndSendReminders();
  }

  /**
   * 외부 트리거용: 예약 작업 즉시 실행
   */
  public async runAllNow(): Promise<void> {
    await this.runScheduledTasks();
  }

  /**
   * 현재 시간에 맞는 리마인드 발송 체크
   */
  private async checkAndSendReminders() {
    try {
      // 오늘 날짜 (YYYY-MM-DD 형식)
      const today = new Date().toISOString().split('T')[0];
      
      // 이미 오늘 알림을 보냈다면 중복 방지
      if (this.lastReminderDate === today) {
        return;
      }
      
      // 모든 활성화된 사용자 설정 조회
      const settingsByTimezone = await discordUserSettingsService.getSettingsByTimezone();
      
      for (const [timezone, settings] of settingsByTimezone.entries()) {
        // 해당 시간대의 현재 시간 계산
        const timezoneTime = this.getCurrentTimeInTimezone(timezone);
        const timezoneTimeString = timezoneTime.toTimeString().slice(0, 5);
        
        // 현재 시간에 정확히 맞는 설정 찾기 (분 단위까지 정확히 일치)
        const matchingSettings = settings.filter(setting => {
          return setting.reminder_time === timezoneTimeString && setting.reminder_enabled;
        });
        
        if (matchingSettings.length > 0) {          
          // 각 사용자별로 리마인드 발송
          for (const setting of matchingSettings) {
            await this.sendUserReminder(setting.user_id);
          }
          
          // 오늘 알림을 보냈다고 기록
          this.lastReminderDate = today;
          break; // 한 번에 하나의 시간대만 처리
        }
      }
    } catch (error) {
      console.error('리마인드 체크 오류:', error);
    }
  }

  /**
   * 특정 시간대의 현재 시간 반환
   */
  private getCurrentTimeInTimezone(timezone: string): Date {
    try {
      return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    } catch (error) {
      console.error(`시간대 ${timezone} 변환 오류:`, error);
      return new Date(); // 기본값으로 현재 시간 반환
    }
  }


  /**
   * 예약된 작업 실행
   */
  private async runScheduledTasks() {
    try {      
      await Promise.all([
        this.checkDueDateReminders(),
        this.checkOverdueTasks(),
        this.checkCompletedTasks(),
      ]);
    } catch (error) {
      console.error('Discord 예약 작업 실행 오류:', error);
    }
  }

  /**
   * 마감일 알림 확인
   */
  private async checkDueDateReminders() {
    try {
      // 오늘 마감인 업무 조회
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const { data: dueTasks, error } = await this.supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name, avatar_url),
          project:project_id(id, name, color)
        `)
        .in('status', ['pending', 'in_progress'])
        .not('due_date', 'is', null)
        .gte('due_date', today.toISOString())
        .lt('due_date', tomorrow.toISOString());

      if (error) {
        console.error('마감일 업무 조회 오류:', error);
        return;
      }

      if (!dueTasks || dueTasks.length === 0) {
        return;
      }

      // 각 업무별로 알림 발송 (봇 방식)
      const botService = getDiscordBotService();
      if (botService) {
        for (const task of dueTasks) {
            // 팀의 Discord 채널 ID 가져오기
            const { data: teamData } = await this.supabase
              .from('teams')
              .select('discord_channel_id')
              .eq('id', task.team_id)
              .single();

            if (teamData?.discord_channel_id) {
              await botService.sendNotificationWithButtons(
                teamData.discord_channel_id,
                {
                  title: '⏰ 마감일 알림',
                  description: `**${task.title}** 업무의 마감일이 다가왔습니다.`,
                  color: 0xff8800, // 주황색
                  fields: [
                    { name: '업무 제목', value: task.title, inline: true },
                    { name: '마감일', value: task.due_date ? new Date(task.due_date).toLocaleDateString('ko-KR') : '미설정', inline: true },
                    { name: '담당자', value: task.assignee?.name || '미지정', inline: true },
                    { name: '우선순위', value: task.priority, inline: true },
                    { name: '상태', value: task.status, inline: true },
                  ],
                  footer: {
                    text: 'Flowra 업무 관리 시스템',
                  },
                  timestamp: new Date().toISOString(),
                },
                task.id
              );
            }
        }
      }

    } catch (error) {
      console.error('마감일 알림 확인 오류:', error);
    }
  }

  /**
   * 연체 업무 확인
   */
  private async checkOverdueTasks() {
    try {
      const now = new Date();

      const { data: overdueTasks, error } = await this.supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name, avatar_url),
          project:project_id(id, name, color)
        `)
        .in('status', ['pending', 'in_progress'])
        .not('due_date', 'is', null)
        .lt('due_date', now.toISOString());

      if (error) {
        console.error('연체 업무 조회 오류:', error);
        return;
      }

      if (!overdueTasks || overdueTasks.length === 0) {
        return;
      }

      // 연체 업무 알림 발송 (하루에 한 번만)
      for (const task of overdueTasks) {
        // 마지막 연체 알림 시간 확인
        const { data: lastNotification } = await this.supabase
          .from('notifications')
          .select('created_at')
          .eq('type', 'task_overdue')
          .eq('data->>task_id', task.id)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .single();

        if (!lastNotification) {
          // 봇 방식으로 연체 알림 발송
          const botService = getDiscordBotService();
          if (botService) {
            // 팀의 Discord 채널 ID 가져오기
            const { data: teamData } = await this.supabase
              .from('teams')
              .select('discord_channel_id')
              .eq('id', task.team_id)
              .single();

            if (teamData?.discord_channel_id) {
              await botService.sendNotificationWithButtons(
                teamData.discord_channel_id,
                {
                  title: '🚨 연체 업무 알림',
                  description: `**${task.title}** 업무가 마감일을 넘겼습니다.`,
                  color: 0xff0000, // 빨간색
                  fields: [
                    { name: '업무 제목', value: task.title, inline: true },
                    { name: '마감일', value: new Date(task.due_date).toLocaleDateString('ko-KR'), inline: true },
                    { name: '담당자', value: task.assignee?.name || '미지정', inline: true },
                  ],
                  timestamp: new Date().toISOString(),
                },
                task.id
              );
            }
          }
        }
      }

    } catch (error) {
      console.error('연체 업무 확인 오류:', error);
    }
  }

  /**
   * 특정 사용자에게 업무 리마인드 발송
   */
  private async sendUserReminder(userId: string) {
    try {
      // 사용자 정보 조회
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('id, name, email')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('사용자 정보 조회 오류:', userError);
        return;
      }

      // 사용자가 속한 팀 조회
      const { data: teamMembers, error: teamError } = await this.supabase
        .from('team_members')
        .select('team_id, team:teams(id, name, discord_channel_id)')
        .eq('user_id', userId);

      if (teamError || !teamMembers || teamMembers.length === 0) {
        console.error('팀 정보 조회 오류:', teamError);
        return;
      }

      // 각 팀별로 업무 리마인드 발송
      for (const member of teamMembers) {
        const team = member.team;

        // 내일 마감 업무 조회
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStart = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
        const tomorrowEnd = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1);

        const { data: tomorrowTasks, error: tasksError } = await this.supabase
          .from('tasks')
          .select(`
            id, title, description, due_date, priority, status,
            project:project_id(id, name, color)
          `)
          .eq('team_id', team.id)
          .eq('assignee_id', userId)
          .in('status', ['pending', 'in_progress'])
          .gte('due_date', tomorrowStart.toISOString())
          .lt('due_date', tomorrowEnd.toISOString());

        if (tasksError) {
          console.error('내일 마감 업무 조회 오류:', tasksError);
          continue;
        }

        // Discord 알림 발송 (봇 방식)
        const botService = getDiscordBotService();
        if (botService) {
          if (tomorrowTasks && tomorrowTasks.length > 0) {
            await this.sendTaskReminderWithBot(botService, team.id, user.name, tomorrowTasks);
          } else {
            await this.sendNoTaskReminderWithBot(botService, team.id, user.name);
          }
        }
      }
    } catch (error) {
      console.error('사용자 리마인드 발송 오류:', error);
    }
  }

  /**
   * 봇을 사용한 업무 리마인드 메시지 발송
   */
  private async sendTaskReminderWithBot(botService: any, teamId: string, userName: string, tasks: any[]) {
    try {
      const taskList = tasks.map(task => {
        const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        const project = task.project ? `[${task.project.name}]` : '';
        return `${priority} **${task.title}** ${project}\n   📅 ${new Date(task.due_date).toLocaleDateString('ko-KR')}\n   📝 ${task.description || '설명 없음'}`;
      }).join('\n\n');

      const embed = {
        title: `📋 ${userName}님의 내일 마감 업무`,
        description: `다음 업무들이 내일 마감입니다:\n\n${taskList}`,
        color: 0x3498db, // 파란색
        fields: [
          {
            name: '📊 업무 현황',
            value: `총 ${tasks.length}개의 업무가 내일 마감됩니다.`,
            inline: true
          }
        ],
        footer: {
          text: 'Flowra 업무 관리 시스템',
          icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
        },
        timestamp: new Date().toISOString()
      };

      // 팀의 Discord 채널 ID 가져오기
      const { data: teamData } = await this.supabase
        .from('teams')
        .select('discord_channel_id')
        .eq('id', teamId)
        .single();

      // 첫 번째 업무에 대한 버튼만 포함 (실제로는 여러 업무에 대한 버튼을 만들 수 있음)
      const firstTask = tasks[0];
      if (firstTask && teamData?.discord_channel_id) {
        await botService.sendNotificationWithButtons(
          teamData.discord_channel_id,
          embed,
          firstTask.id
        );
      }

      return true;
    } catch (error) {
      console.error('봇 업무 리마인드 발송 오류:', error);
      return false;
    }
  }

  /**
   * 봇을 사용한 업무 없음 알림 발송
   */
  private async sendNoTaskReminderWithBot(botService: any, teamId: string, userName: string) {
    try {
      const embed = {
        title: `🎉 ${userName}님의 내일 업무`,
        description: `내일 마감 예정인 업무가 없습니다!\n\n오늘 하루도 화이팅하세요! 💪`,
        color: 0x2ecc71, // 초록색
        footer: {
          text: 'Flowra 업무 관리 시스템',
          icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
        },
        timestamp: new Date().toISOString()
      };

      // 팀의 Discord 채널 ID 가져오기
      const { data: teamData } = await this.supabase
        .from('teams')
        .select('discord_channel_id')
        .eq('id', teamId)
        .single();

      if (teamData?.discord_channel_id) {
        await botService.sendNotificationWithButtons(
          teamData.discord_channel_id,
          embed,
          undefined // taskId 없음
        );
      }
      return true;
    } catch (error) {
      console.error('봇 업무 없음 알림 발송 오류:', error);
      return false;
    }
  }

  /**
   * 업무 리마인드 메시지 발송 (인터랙션 버튼 포함) - 웹훅 fallback
   */
  private async sendTaskReminderWithActions(webhookUrl: string, userName: string, tasks: any[]) {
    try {
      const taskList = tasks.map(task => {
        const priority = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        const project = task.project ? `[${task.project.name}]` : '';
        return `${priority} **${task.title}** ${project}\n   📅 ${new Date(task.due_date).toLocaleDateString('ko-KR')}\n   📝 ${task.description || '설명 없음'}`;
      }).join('\n\n');

      const embed = {
        title: `📋 ${userName}님의 내일 마감 업무`,
        description: `다음 업무들이 내일 마감입니다:\n\n${taskList}`,
        color: 0x3498db, // 파란색
        fields: [
          {
            name: '📊 업무 현황',
            value: `총 ${tasks.length}개의 업무가 내일 마감됩니다.`,
            inline: true
          },
          {
            name: '⚡ 빠른 액션',
            value: '아래 버튼을 사용하여 업무를 관리하세요!',
            inline: false
          }
        ],
        footer: {
          text: 'Flowra 업무 관리 시스템',
          icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
        },
        timestamp: new Date().toISOString()
      };

      const message = {
        embeds: [embed],
        username: 'Flowra Bot',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
        content: `@${userName} 내일 마감 업무 리마인드입니다! 🚀\n\n**📋 업무 관리 명령어:**\n\n` +
          tasks.map(task => 
            `**${task.title}**\n` +
            `\`/flowra complete ${task.id}\` - ✅ 완료\n` +
            `\`/flowra extend ${task.id} 1\` - ⏰ 1일 연장\n` +
            `\`/flowra reschedule ${task.id} 2024-12-25\` - 📅 일정 변경\n` +
            `\`/flowra view ${task.id}\` - 📋 상세보기`
          ).join('\n\n') +
          `\n\n*명령어를 입력하여 업무를 관리하세요!*`
      };

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
      console.error('업무 리마인드 발송 오류:', error);
      return false;
    }
  }

  /**
   * 업무 없음 알림 발송
   */
  private async sendNoTaskReminder(webhookUrl: string, userName: string) {
    try {
      const embed = {
        title: `🎉 ${userName}님의 내일 업무`,
        description: `내일 마감 예정인 업무가 없습니다!\n\n오늘 하루도 화이팅하세요! 💪`,
        color: 0x2ecc71, // 초록색
        footer: {
          text: 'Flowra 업무 관리 시스템',
          icon_url: 'https://cdn.discordapp.com/embed/avatars/0.png'
        },
        timestamp: new Date().toISOString()
      };

      const message = {
        embeds: [embed],
        username: 'Flowra Bot',
        avatar_url: 'https://cdn.discordapp.com/embed/avatars/0.png',
        content: `@${userName} 내일 마감 업무가 없습니다! 🎉`
      };

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
      console.error('업무 없음 알림 발송 오류:', error);
      return false;
    }
  }

  /**
   * 완료된 업무 확인
   */
  private async checkCompletedTasks() {
    try {
      // 최근 완료된 업무 조회 (1시간 이내)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const { data: completedTasks, error } = await this.supabase
        .from('tasks')
        .select(`
          *,
          assignee:assignee_id(id, name, avatar_url),
          project:project_id(id, name, color)
        `)
        .eq('status', 'completed')
        .gte('completed_at', oneHourAgo.toISOString());

      if (error) {
        console.error('완료된 업무 조회 오류:', error);
        return;
      }

      if (!completedTasks || completedTasks.length === 0) {
        return;
      }

      // 완료 알림 발송 (봇 방식)
      const botService = getDiscordBotService();
      if (botService) {
        for (const task of completedTasks) {
          // 팀의 Discord 채널 ID 가져오기
          const { data: teamData } = await this.supabase
            .from('teams')
            .select('discord_channel_id')
            .eq('id', task.team_id)
            .single();

          if (teamData?.discord_channel_id) {
            await botService.sendNotificationWithButtons(
              teamData.discord_channel_id,
              {
                title: '🎉 업무 완료!',
                description: `**${task.title}** 업무가 완료되었습니다.`,
                color: 0x00ff00, // 초록색
                fields: [
                  { name: '업무 제목', value: task.title, inline: true },
                  { name: '완료자', value: task.assignee?.name || '미지정', inline: true },
                  { name: '완료 시간', value: new Date().toLocaleString('ko-KR'), inline: true },
                ],
                footer: {
                  text: 'Flowra 업무 관리 시스템',
                },
                timestamp: new Date().toISOString(),
              },
              task.id
            );
          }
        }
      }
    } catch (error) {
      console.error('완료된 업무 확인 오류:', error);
    }
  }

  // 웹훅 관련 로직 제거됨 (봇 전환)

  /**
   * 스케줄러 상태 조회
   */
  getStatus() {
    return {
      isRunning: !!(this.intervalId || this.reminderIntervalId),
      intervalId: this.intervalId,
      reminderIntervalId: this.reminderIntervalId,
      message: (this.intervalId || this.reminderIntervalId) 
        ? '스케줄러가 실행 중입니다.' 
        : '스케줄러가 중지되었습니다.',
    };
  }
}

// 싱글톤 인스턴스
export const discordWebhookScheduler = new DiscordWebhookScheduler();
