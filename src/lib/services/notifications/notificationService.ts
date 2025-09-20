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
        console.log('이메일 알림이 비활성화됨:', {
          userId: notification.user_id,
          type: notification.type
        });
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
      const result = await sendNotificationEmail(emailData);
      
      if (result.success) {
        console.log('✅ 이메일 알림 발송 성공:', {
          userId: notification.user_id,
          type: notification.type,
          messageId: result.messageId
        });
      } else {
        console.error('❌ 이메일 알림 발송 실패:', {
          userId: notification.user_id,
          type: notification.type,
          error: result.error
        });
      }

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
        console.log('푸시 구독이 없음:', notification.user_id);
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
        console.log('푸시 알림이 비활성화됨:', {
          userId: notification.user_id,
          type: notification.type
        });
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
      const results = await Promise.allSettled(
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

      const successCount = results.filter(result => 
        result.status === 'fulfilled' && result.value.success
      ).length;

      console.log('✅ 푸시 알림 발송 완료:', {
        userId: notification.user_id,
        type: notification.type,
        total: subscriptions.length,
        success: successCount,
        failed: subscriptions.length - successCount
      });

    } catch (error) {
      console.error('푸시 알림 발송 중 오류:', error);
    }
  }
}

// 싱글톤 인스턴스
export const notificationService = new NotificationService();
