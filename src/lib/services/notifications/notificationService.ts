import { createServiceClient } from '@/lib/supabase/server';
import { sendNotificationEmail, type NotificationEmailData } from '@/lib/services/email/emailService';
import webpush from 'web-push';
import type { 
  CreateNotificationRequest, 
  NotificationType, 
  NotificationData,
  NotificationBatch 
} from '@/types/notifications';

/**
 * 알림 서비스 클래스
 * 알림 생성, 전송, 관리 기능을 제공합니다.
 */
export class NotificationService {
  private supabase;

  constructor() {
    this.supabase = createServiceClient();
    
    // VAPID 키 설정
    if (process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_KEY) {
      webpush.setVapidDetails(
        'mailto:noreply@flowra.com',
        process.env.NEXT_PUBLIC_VAPID_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    }
  }

  /**
   * 단일 알림 생성
   */
  async createNotification(notification: CreateNotificationRequest) {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          content: notification.content || null,
          data: notification.data || {},
          expires_at: notification.expires_at || null,
          is_read: false,
        })
        .select()
        .single();

      if (error) {
        console.error('알림 생성 오류:', error);
        throw error;
      }

      // 이메일 알림 발송 (비동기)
      this.sendEmailNotification(data).catch(error => {
        console.error('이메일 알림 발송 오류:', error);
      });

      // 푸시 알림 발송 (비동기)
      this.sendPushNotification(data).catch(error => {
        console.error('푸시 알림 발송 오류:', error);
      });

      // Discord 알림 발송 (비동기)
      this.sendDiscordNotification(data).catch(error => {
        console.error('Discord 알림 발송 오류:', error);
      });

      return data;
    } catch (error) {
      console.error('알림 생성 중 오류:', error);
      throw error;
    }
  }

  /**
   * 배치 알림 생성
   */
  async createNotificationBatch(batch: NotificationBatch) {
    try {
      const notifications = batch.notifications.map(notification => ({
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        content: notification.content || null,
        data: notification.data || {},
        expires_at: notification.expires_at || null,
        is_read: false,
      }));

      const { data, error } = await this.supabase
        .from('notifications')
        .insert(notifications)
        .select();

      if (error) {
        console.error('배치 알림 생성 오류:', error);
        throw error;
      }

      // 이메일 및 푸시 알림 발송 (비동기)
      if (batch.send_immediately) {
        data.forEach(notification => {
          this.sendEmailNotification(notification).catch(error => {
            console.error('이메일 알림 발송 오류:', error);
          });
          this.sendPushNotification(notification).catch(error => {
            console.error('푸시 알림 발송 오류:', error);
          });
        });
      }

      return data;
    } catch (error) {
      console.error('배치 알림 생성 중 오류:', error);
      throw error;
    }
  }

  /**
   * 태스크 할당 알림 생성
   */
  async createTaskAssignedNotification(
    assigneeId: string,
    taskData: {
      taskId: string;
      taskTitle: string;
      assignerName: string;
      projectName?: string;
      teamName?: string;
    }
  ) {
    const notification: CreateNotificationRequest = {
      user_id: assigneeId,
      type: 'task_assigned',
      title: `새로운 업무가 할당되었습니다: ${taskData.taskTitle}`,
      content: `${taskData.assignerName}님이 "${taskData.taskTitle}" 업무를 할당했습니다.`,
      data: {
        task_id: taskData.taskId,
        task_title: taskData.taskTitle,
        assigner_name: taskData.assignerName,
        project_name: taskData.projectName,
        team_name: taskData.teamName,
      } as NotificationData,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
    };

    return this.createNotification(notification);
  }

  /**
   * 태스크 마감일 임박 알림 생성
   */
  async createTaskDueNotification(
    assigneeId: string,
    taskData: {
      taskId: string;
      taskTitle: string;
      dueDate: string;
      projectName?: string;
      teamName?: string;
    }
  ) {
    const dueDate = new Date(taskData.dueDate);
    const now = new Date();
    const hoursUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60));

    let title: string;
    let content: string;

    if (hoursUntilDue <= 24) {
      title = `⚠️ 마감일 임박: ${taskData.taskTitle}`;
      content = `${taskData.taskTitle} 업무가 ${hoursUntilDue}시간 후 마감됩니다.`;
    } else {
      title = `📅 마감일 알림: ${taskData.taskTitle}`;
      content = `${taskData.taskTitle} 업무가 ${Math.ceil(hoursUntilDue / 24)}일 후 마감됩니다.`;
    }

    const notification: CreateNotificationRequest = {
      user_id: assigneeId,
      type: 'task_due',
      title,
      content,
      data: {
        task_id: taskData.taskId,
        task_title: taskData.taskTitle,
        due_date: taskData.dueDate,
        hours_until_due: hoursUntilDue,
        project_name: taskData.projectName,
        team_name: taskData.teamName,
      } as NotificationData,
      expires_at: dueDate.toISOString(),
    };

    return this.createNotification(notification);
  }

  /**
   * 태스크 지연 알림 생성
   */
  async createTaskOverdueNotification(
    assigneeId: string,
    taskData: {
      taskId: string;
      taskTitle: string;
      dueDate: string;
      projectName?: string;
      teamName?: string;
    }
  ) {
    const dueDate = new Date(taskData.dueDate);
    const now = new Date();
    const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    const notification: CreateNotificationRequest = {
      user_id: assigneeId,
      type: 'task_overdue',
      title: `🚨 지연된 업무: ${taskData.taskTitle}`,
      content: `${taskData.taskTitle} 업무가 ${daysOverdue}일 지연되었습니다.`,
      data: {
        task_id: taskData.taskId,
        task_title: taskData.taskTitle,
        due_date: taskData.dueDate,
        days_overdue: daysOverdue,
        project_name: taskData.projectName,
        team_name: taskData.teamName,
      } as NotificationData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
    };

    return this.createNotification(notification);
  }

  /**
   * 팀 초대 알림 생성
   */
  async createTeamInvitationNotification(
    inviteeId: string,
    invitationData: {
      teamId: string;
      teamName: string;
      inviterName: string;
      invitationId: string;
    }
  ) {
    const notification: CreateNotificationRequest = {
      user_id: inviteeId,
      type: 'team_invitation',
      title: `팀 초대: ${invitationData.teamName}`,
      content: `${invitationData.inviterName}님이 "${invitationData.teamName}" 팀에 초대했습니다.`,
      data: {
        team_id: invitationData.teamId,
        team_name: invitationData.teamName,
        inviter_name: invitationData.inviterName,
        invitation_id: invitationData.invitationId,
      } as NotificationData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
    };

    return this.createNotification(notification);
  }

  /**
   * 태스크 완료 알림 생성 (관련자들에게)
   */
  async createTaskCompletedNotification(
    assigneeId: string,
    taskData: {
      taskId: string;
      taskTitle: string;
      projectName?: string;
      teamName?: string;
    }
  ) {
    const notification: CreateNotificationRequest = {
      user_id: assigneeId,
      type: 'task_completed',
      title: `✅ 완료된 업무: ${taskData.taskTitle}`,
      content: `${taskData.taskTitle} 업무가 완료되었습니다.`,
      data: {
        task_id: taskData.taskId,
        task_title: taskData.taskTitle,
        project_name: taskData.projectName,
        team_name: taskData.teamName,
        completed_at: new Date().toISOString(),
      } as NotificationData,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7일 후 만료
    };

    return this.createNotification(notification);
  }

  /**
   * 시스템 알림 생성
   */
  async createSystemNotification(
    userId: string,
    title: string,
    content: string,
    data?: NotificationData
  ) {
    const notification: CreateNotificationRequest = {
      user_id: userId,
      type: 'system',
      title,
      content,
      data: data || {},
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30일 후 만료
    };

    return this.createNotification(notification);
  }

  /**
   * 사용자의 알림 설정 확인
   */
  async getUserNotificationPreferences(userId: string, type: NotificationType) {
    try {
      const { data, error } = await this.supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('알림 설정 조회 오류:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('알림 설정 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 만료된 알림 정리
   */
  async cleanupExpiredNotifications() {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .not('expires_at', 'is', null);

      if (error) {
        console.error('만료된 알림 정리 오류:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('만료된 알림 정리 중 오류:', error);
      throw error;
    }
  }

  /**
   * 사용자의 읽지 않은 알림 개수 조회
   */
  async getUnreadNotificationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .or('expires_at.is.null,expires_at.gt.now()');

      if (error) {
        console.error('읽지 않은 알림 개수 조회 오류:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('읽지 않은 알림 개수 조회 중 오류:', error);
      throw error;
    }
  }

  /**
   * 이메일 알림 발송
   */
  private async sendEmailNotification(notification: any) {
    try {
      // 사용자 정보 조회
      const { data: user, error: userError } = await this.supabase
        .from('users')
        .select('email, name')
        .eq('id', notification.user_id)
        .single();

      if (userError || !user) {
        console.error('사용자 정보 조회 오류:', userError);
        return;
      }

      // 알림 설정 확인 (이메일 알림 활성화 여부)
      const { data: preferences } = await this.supabase
        .from('notification_preferences')
        .select('email_enabled')
        .eq('user_id', notification.user_id)
        .eq('type', notification.type)
        .single();

      // 이메일 알림이 비활성화된 경우 스킵
      if (preferences && preferences.email_enabled === false) {
        return;
      }

      // 액션 URL 생성
      let actionUrl: string | undefined;
      if (notification.data?.task_id) {
        actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tasks?taskId=${notification.data.task_id}`;
      } else if (notification.data?.team_id) {
        actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team?teamId=${notification.data.team_id}`;
      }

      // 이메일 데이터 준비
      const emailData: NotificationEmailData = {
        recipientEmail: user.email,
        recipientName: user.name || undefined,
        notificationType: notification.type,
        title: notification.title,
        content: notification.content || '',
        actionUrl,
        data: notification.data
      };

      // 이메일 발송
      await sendNotificationEmail(emailData);
    } catch (error) {
      console.error('이메일 알림 발송 중 오류:', error);
    }
  }

  /**
   * 푸시 알림 발송
   */
  private async sendPushNotification(notification: any) {
    try {
      // 푸시 구독 조회 (notifications 테이블에서)
      const { data: subscriptions, error: subscriptionError } = await this.supabase
        .from('notifications')
        .select('data')
        .eq('user_id', notification.user_id)
        .eq('type', 'push_subscription');

      if (subscriptionError || !subscriptions || subscriptions.length === 0) {
        return;
      }

      // 푸시 알림 설정 확인
      const { data: preferences } = await this.supabase
        .from('notification_preferences')
        .select('push_enabled')
        .eq('user_id', notification.user_id)
        .eq('type', notification.type)
        .single();

      // 푸시 알림이 비활성화된 경우 스킵
      if (preferences && preferences.push_enabled === false) {
        return;
      }

      // 액션 URL 생성
      let actionUrl: string | undefined;
      if (notification.data?.task_id) {
        actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tasks?taskId=${notification.data.task_id}`;
      } else if (notification.data?.team_id) {
        actionUrl = `${process.env.NEXT_PUBLIC_APP_URL}/team?teamId=${notification.data.team_id}`;
      }

      // 푸시 알림 페이로드 생성
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.content || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `notification-${notification.id}`,
        data: {
          notificationId: notification.id,
          type: notification.type,
          url: actionUrl,
          timestamp: Date.now(),
        },
        actions: [
          {
            action: 'open',
            title: '열기',
            icon: '/icons/open.png'
          },
          {
            action: 'close',
            title: '닫기',
            icon: '/icons/close.png'
          }
        ]
      });

      // 모든 구독에 푸시 알림 발송
      await Promise.allSettled(
        subscriptions.map(async (subscription) => {
          try {
            const { endpoint, keys } = subscription.data as any;
            await webpush.sendNotification(
              {
                endpoint,
                keys: {
                  p256dh: keys.p256dh,
                  auth: keys.auth,
                },
              },
              payload
            );
            return { success: true, endpoint };
          } catch (error) {
            console.error('푸시 발송 실패:', error);
            return { success: false, endpoint: (subscription.data as any).endpoint, error };
          }
        })
      );

    } catch (error) {
      console.error('푸시 알림 발송 중 오류:', error);
    }
  }

  /**
   * Discord 알림 발송
   */
  private async sendDiscordNotification(notification: any) {
    try {
      // Discord 알림 설정 확인
      const { data: preferences } = await this.supabase
        .from('notification_preferences')
        .select('discord_enabled')
        .eq('user_id', notification.user_id)
        .eq('type', notification.type)
        .single();

      // Discord 알림이 비활성화된 경우 스킵
      if (preferences && preferences.discord_enabled === false) {
        return;
      }

      // 사용자의 팀 정보 조회
      const { data: teamMember } = await this.supabase
        .from('team_members')
        .select(`
          team_id,
          teams!inner(
            id,
            discord_webhook_url,
            discord_guild_id,
            discord_channel_id
          )
        `)
        .eq('user_id', notification.user_id)
        .eq('is_active', true)
        .single();

      if (!teamMember?.teams?.discord_webhook_url) {
        return;
      }

      // Discord 봇 서비스를 동적으로 import
      const { getDiscordBotService } = await import('@/lib/services/discord/discordBotService');

      // Discord 알림 데이터 생성
      const discordNotification = {
        title: this.getDiscordNotificationTitle(notification.type),
        description: this.getDiscordNotificationDescription(notification),
        color: this.getDiscordNotificationColor(notification.type),
        fields: this.getDiscordNotificationFields(notification),
      };

      // Discord 알림 발송 (봇 방식)
      const botService = getDiscordBotService();
      if (botService) {
        // 팀의 Discord 채널 ID 가져오기
        const { data: teamData } = await this.supabase
          .from('teams')
          .select('discord_channel_id')
          .eq('id', teamMember.teams.id)
          .single();

        if (teamData?.discord_channel_id) {
          await botService.sendNotificationWithButtons(
            teamData.discord_channel_id,
            discordNotification,
            notification.data?.task_id
          );
        }
      }
    } catch (error) {
      console.error('Discord 알림 발송 중 오류:', error);
    }
  }

  /**
   * Discord 알림 제목 생성
   */
  private getDiscordNotificationTitle(type: string): string {
    const titles: Record<string, string> = {
      task_assigned: '📋 새로운 업무 할당',
      task_completed: '✅ 업무 완료',
      task_due: '⏰ 마감일 알림',
      task_updated: '📝 업무 업데이트',
      team_invitation: '👥 팀 초대',
      team_member_joined: '🎉 새로운 팀원',
      team_member_left: '👋 팀원 탈퇴',
    };
    return titles[type] || '📢 알림';
  }

  /**
   * Discord 알림 설명 생성
   */
  private getDiscordNotificationDescription(notification: any): string {
    const data = notification.data || {};
    
    switch (notification.type) {
      case 'task_assigned':
        return `"${data.task_title || '제목 없음'}" 업무가 할당되었습니다.`;
      case 'task_completed':
        return `"${data.task_title || '제목 없음'}" 업무가 완료되었습니다.`;
      case 'task_due':
        return `"${data.task_title || '제목 없음'}" 업무의 마감일이 임박했습니다.`;
      case 'task_updated':
        return `"${data.task_title || '제목 없음'}" 업무가 업데이트되었습니다.`;
      case 'team_invitation':
        return `${data.team_name || '팀'}에 초대되었습니다.`;
      case 'team_member_joined':
        return `${data.member_name || '새로운 멤버'}님이 팀에 참여했습니다.`;
      case 'team_member_left':
        return `${data.member_name || '멤버'}님이 팀을 떠났습니다.`;
      default:
        return notification.content || notification.title;
    }
  }

  /**
   * Discord 알림 색상 생성
   */
  private getDiscordNotificationColor(type: string): number {
    const colors: Record<string, number> = {
      task_assigned: 0x3b82f6, // 파란색
      task_completed: 0x10b981, // 초록색
      task_due: 0xf59e0b, // 주황색
      task_updated: 0x8b5cf6, // 보라색
      team_invitation: 0x06b6d4, // 청록색
      team_member_joined: 0x10b981, // 초록색
      team_member_left: 0xef4444, // 빨간색
    };
    return colors[type] || 0x6b7280; // 기본 회색
  }

  /**
   * Discord 알림 필드 생성
   */
  private getDiscordNotificationFields(notification: any): any[] {
    const data = notification.data || {};
    const fields: any[] = [];

    switch (notification.type) {
      case 'task_assigned':
      case 'task_completed':
      case 'task_updated':
        if (data.task_id) {
          fields.push({ name: '업무 ID', value: data.task_id, inline: true });
        }
        if (data.assignee_name) {
          fields.push({ name: '담당자', value: data.assignee_name, inline: true });
        }
        if (data.due_date) {
          fields.push({ name: '마감일', value: new Date(data.due_date).toLocaleDateString('ko-KR'), inline: true });
        }
        if (data.priority) {
          fields.push({ name: '우선순위', value: data.priority, inline: true });
        }
        if (data.project_name) {
          fields.push({ name: '프로젝트', value: data.project_name, inline: true });
        }
        break;

      case 'task_due':
        if (data.task_id) {
          fields.push({ name: '업무 ID', value: data.task_id, inline: true });
        }
        if (data.assignee_name) {
          fields.push({ name: '담당자', value: data.assignee_name, inline: true });
        }
        if (data.due_date) {
          fields.push({ name: '마감일', value: new Date(data.due_date).toLocaleDateString('ko-KR'), inline: true });
        }
        break;

      case 'team_invitation':
        if (data.team_name) {
          fields.push({ name: '팀명', value: data.team_name, inline: true });
        }
        if (data.inviter_name) {
          fields.push({ name: '초대자', value: data.inviter_name, inline: true });
        }
        break;

      case 'team_member_joined':
      case 'team_member_left':
        if (data.team_name) {
          fields.push({ name: '팀명', value: data.team_name, inline: true });
        }
        if (data.member_role) {
          fields.push({ name: '역할', value: data.member_role, inline: true });
        }
        break;
    }

    return fields;
  }
}

// 싱글톤 인스턴스
export const notificationService = new NotificationService();
