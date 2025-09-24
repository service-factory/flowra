import { createServiceClient } from '@/lib/supabase/server';

// Discord.js는 서버에서만 사용하므로 빌드 시점에는 import하지 않음

export class DiscordBotService {
  private client: any = null;
  private rest: any = null;
  private isReady = false;
  private discordJS: any = null;

  constructor() {
    // Discord.js는 서버에서만 동적 import
    this.initializeDiscordJS();
  }

  private async initializeDiscordJS() {
    if (typeof window !== 'undefined' || !process.env.DISCORD_BOT_TOKEN) {
      // 클라이언트 사이드이거나 토큰이 없으면 실행하지 않음
      return;
    }

    try {
      // Discord.js 동적 import (eval 사용으로 빌드 시점 import 방지)
      const discordModule = await eval('import("discord.js")');
      this.discordJS = discordModule;
      
      // Discord 클라이언트 초기화
      this.client = new this.discordJS.Client({
        intents: [
          this.discordJS.GatewayIntentBits.Guilds,
          this.discordJS.GatewayIntentBits.GuildMessages,
          this.discordJS.GatewayIntentBits.MessageContent,
          this.discordJS.GatewayIntentBits.GuildMessageReactions,
        ],
      });

      // REST API 초기화
      this.rest = new this.discordJS.REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN!);

      this.setupEventHandlers();
    } catch (error) {
      console.error('Discord.js 초기화 실패:', error);
    }
  }

  /**
   * 봇 시작
   */
  async start(): Promise<void> {
    try {
      if (!this.client) {
        await this.initializeDiscordJS();
      }

      if (!this.client) {
        throw new Error('Discord 클라이언트를 초기화할 수 없습니다.');
      }
      
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
      
      // 슬래시 명령어 등록
      await this.registerSlashCommands();
    } catch (error) {
      console.error('❌ Discord 봇 시작 실패:', error);
      throw error;
    }
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // 봇 준비 완료
    this.client.once('ready', () => {
      this.isReady = true;
    });

    // 슬래시 명령어 처리
    this.client.on('interactionCreate', async (interaction: any) => {
      if (interaction.isCommand()) {
        await this.handleSlashCommand(interaction);
      } else if (interaction.isButton()) {
        await this.handleButtonInteraction(interaction);
      }
    });

    // 에러 처리
    this.client.on('error', (error: any) => {
      console.error('Discord 봇 에러:', error);
    });
  }

  /**
   * 슬래시 명령어 등록
   */
  private async registerSlashCommands(): Promise<void> {
    if (!this.discordJS || !this.rest) {
      return;
    }

    try {
      const commands = [
        new this.discordJS.SlashCommandBuilder()
          .setName('flowra')
          .setDescription('Flowra 업무 관리 명령어')
          .addSubcommand(subcommand =>
            subcommand
              .setName('complete')
              .setDescription('업무 완료')
              .addStringOption(option =>
                option
                  .setName('taskid')
                  .setDescription('업무 ID')
                  .setRequired(true)
              )
          )
          .addSubcommand(subcommand =>
            subcommand
              .setName('extend')
              .setDescription('업무 연장')
              .addStringOption(option =>
                option
                  .setName('taskid')
                  .setDescription('업무 ID')
                  .setRequired(true)
              )
              .addIntegerOption(option =>
                option
                  .setName('days')
                  .setDescription('연장할 일수')
                  .setRequired(true)
                  .setMinValue(1)
              )
          )
          .addSubcommand(subcommand =>
            subcommand
              .setName('view')
              .setDescription('업무 상세보기')
              .addStringOption(option =>
                option
                  .setName('taskid')
                  .setDescription('업무 ID')
                  .setRequired(true)
              )
          ),
      ];

      // 명령어 등록
      await this.rest.put(
        this.discordJS.Routes.applicationCommands(process.env.DISCORD_CLIENT_ID!),
        { body: commands }
      );
    } catch (error) {
      console.error('❌ 슬래시 명령어 등록 실패:', error);
    }
  }

  /**
   * 슬래시 명령어 처리
   */
  private async handleSlashCommand(interaction: any): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    try {
      const subcommand = interaction.options.getSubcommand();
      const taskId = interaction.options.getString('taskid', true);

      // 팀 ID 추출
      const guildId = interaction.guildId;

      if (!guildId) {
        await interaction.reply({ content: '❌ 서버에서만 사용할 수 있습니다.', ephemeral: true });
        return;
      }

      // Discord 서버 ID로 팀 찾기
      const supabase = createServiceClient();
      const { data: team } = await supabase
        .from('teams')
        .select('id, discord_guild_id')
        .eq('discord_guild_id', guildId)
        .single();

      if (!team) {
        await interaction.reply({ content: '❌ 이 서버는 Flowra와 연결되지 않았습니다.', ephemeral: true });
        return;
      }

      const userId = await this.getUserIdFromDiscord();

      switch (subcommand) {
        case 'complete':
          await this.handleCompleteTask(interaction, taskId, userId, team.id);
          break;
        case 'extend':
          const days = interaction.options.getInteger('days', true);
          await this.handleExtendTask(interaction, taskId, userId, team.id, days);
          break;
        case 'view':
          await this.handleViewTask(interaction, taskId, userId, team.id);
          break;
        default:
          await interaction.reply({ content: '❌ 알 수 없는 명령어입니다.', ephemeral: true });
      }
    } catch (error) {
      console.error('슬래시 명령어 처리 오류:', error);
      await interaction.reply({ content: '❌ 명령어 처리 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 버튼 인터랙션 처리
   */
  private async handleButtonInteraction(interaction: any): Promise<void> {
    try {
      const [action, taskId] = interaction.customId.split('_');
      
      if (!taskId) {
        await interaction.reply({ content: '❌ 잘못된 버튼입니다.', ephemeral: true });
        return;
      }

      const guildId = interaction.guildId;
      if (!guildId) {
        await interaction.reply({ content: '❌ 서버에서만 사용할 수 있습니다.', ephemeral: true });
        return;
      }

      // 팀 찾기
      const supabase = createServiceClient();
      const { data: team } = await supabase
        .from('teams')
        .select('id, discord_guild_id')
        .eq('discord_guild_id', guildId)
        .single();

      if (!team) {
        await interaction.reply({ content: '❌ 이 서버는 Flowra와 연결되지 않았습니다.', ephemeral: true });
        return;
      }

      const userId = await this.getUserIdFromDiscord();

      switch (action) {
        case 'complete':
          await this.handleCompleteTaskButton(interaction, taskId, userId, team.id);
          break;
        case 'extend':
          await this.handleExtendTaskButton(interaction, taskId, userId, team.id);
          break;
        case 'view':
          await this.handleViewTaskButton(interaction, taskId, userId, team.id);
          break;
        default:
          await interaction.reply({ content: '❌ 알 수 없는 액션입니다.', ephemeral: true });
      }
    } catch (error) {
      console.error('버튼 인터랙션 처리 오류:', error);
      await interaction.reply({ content: '❌ 버튼 처리 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 업무 완료 처리
   */
  private async handleCompleteTask(interaction: any, taskId: string, userId: string, teamId: string): Promise<void> {
    try {
      const result = await this.executeTaskAction('complete', taskId, userId, teamId);
      
      if (result.success) {
        await interaction.reply({ content: '✅ 업무가 완료되었습니다!', ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ 업무 완료 처리 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 업무 연장 처리
   */
  private async handleExtendTask(interaction: any, taskId: string, userId: string, teamId: string, days: number): Promise<void> {
    try {
      const result = await this.executeTaskAction('extend', taskId, userId, teamId, { days });
      
      if (result.success) {
        await interaction.reply({ content: `⏰ 업무가 ${days}일 연장되었습니다!`, ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ 업무 연장 처리 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 업무 상세보기 처리
   */
  private async handleViewTask(interaction: any, taskId: string, userId: string, teamId: string): Promise<void> {
    try {
      const result = await this.executeTaskAction('view', taskId, userId, teamId);
      
      if (result.success && this.discordJS) {
        const embed = new this.discordJS.EmbedBuilder()
          .setTitle('📋 업무 상세 정보')
          .setDescription(result.data.task.title)
          .addFields(
            { name: '상태', value: result.data.task.status, inline: true },
            { name: '마감일', value: new Date(result.data.task.due_date).toLocaleDateString('ko-KR'), inline: true },
            { name: '담당자', value: result.data.task.assignee?.name || '미지정', inline: true }
          )
          .setColor(0x3498db);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ 업무 조회 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 버튼을 통한 업무 완료 처리
   */
  private async handleCompleteTaskButton(interaction: any, taskId: string, userId: string, teamId: string): Promise<void> {
    try {
      const result = await this.executeTaskAction('complete', taskId, userId, teamId);
      
      if (result.success) {
        await interaction.reply({ content: '✅ 업무가 완료되었습니다!', ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ 업무 완료 처리 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 버튼을 통한 업무 연장 처리
   */
  private async handleExtendTaskButton(interaction: any, taskId: string, userId: string, teamId: string): Promise<void> {
    try {
      const result = await this.executeTaskAction('extend', taskId, userId, teamId, { days: 1 });
      
      if (result.success) {
        await interaction.reply({ content: '⏰ 업무가 1일 연장되었습니다!', ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ 업무 연장 처리 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 버튼을 통한 업무 상세보기 처리
   */
  private async handleViewTaskButton(interaction: any, taskId: string, userId: string, teamId: string): Promise<void> {
    try {
      const result = await this.executeTaskAction('view', taskId, userId, teamId);
      
      if (result.success && this.discordJS) {
        const embed = new this.discordJS.EmbedBuilder()
          .setTitle('📋 업무 상세 정보')
          .setDescription(result.data.task.title)
          .addFields(
            { name: '상태', value: result.data.task.status, inline: true },
            { name: '마감일', value: new Date(result.data.task.due_date).toLocaleDateString('ko-KR'), inline: true },
            { name: '담당자', value: result.data.task.assignee?.name || '미지정', inline: true }
          )
          .setColor(0x3498db);

        await interaction.reply({ embeds: [embed], ephemeral: true });
      } else {
        await interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
      }
    } catch {
      await interaction.reply({ content: '❌ 업무 조회 중 오류가 발생했습니다.', ephemeral: true });
    }
  }

  /**
   * 업무 액션 실행
   */
  private async executeTaskAction(action: string, taskId: string, userId: string, teamId: string, data?: any): Promise<any> {
    try {
      const { getAppBaseUrl } = await import('@/lib/utils');
      const baseUrl = getAppBaseUrl();
      const response = await fetch(`${baseUrl}/api/discord/interactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          action,
          userId,
          teamId,
          data,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('업무 액션 실행 오류:', error);
      return { success: false, message: '서버 오류가 발생했습니다.' };
    }
  }

  /**
   * Discord 사용자 ID를 실제 사용자 ID로 매핑
   */
  private async getUserIdFromDiscord(): Promise<string> {
    // TODO: Discord 사용자 ID와 실제 사용자 ID 매핑 로직 구현
    // 현재는 테스트용으로 더미 사용자 ID 반환
    return 'c9a67131-fedd-4620-b7be-cf7a40f8b2ca';
  }

  /**
   * 채널에 알림 메시지 발송 (개선된 버튼 포함)
   */
  async sendNotificationWithButtons(channelId: string, embed: any, taskId: string | undefined, notificationType: string = 'general'): Promise<void> {
    try {
      if (!this.discordJS || !this.client) {
        throw new Error('Discord.js가 초기화되지 않았습니다.');
      }

      // 알림 타입별 맞춤형 버튼 구성
      const subtle = {
        Success: this.discordJS.ButtonStyle.Success,
        Primary: this.discordJS.ButtonStyle.Secondary, // 강한 블루 대신 중립 톤
        Secondary: this.discordJS.ButtonStyle.Secondary,
        Danger: this.discordJS.ButtonStyle.Secondary // 과한 레드 사용 회피
      };

      const buttonConfigs = {
        reminder: {
          primary: {
            customId: taskId ? `start_${taskId}` : 'start_noop',
            label: '진행 시작',
            emoji: '▶️',
            style: subtle.Success
          },
          secondary: [
            {
              customId: taskId ? `reschedule_${taskId}` : 'reschedule_noop',
              label: '일정 조정',
              emoji: '🗓️',
              style: subtle.Primary
            },
            {
              customId: taskId ? `view_${taskId}` : 'view_noop',
              label: '상세보기',
              emoji: '👁️',
              style: subtle.Secondary
            }
          ]
        },
        due_date: {
          primary: {
            customId: taskId ? `complete_${taskId}` : 'complete_noop',
            label: '완료 처리',
            emoji: '✅',
            style: subtle.Success
          },
          secondary: [
            {
              customId: taskId ? `extend_${taskId}` : 'extend_noop',
              label: '기한 연장',
              emoji: '⏳',
              style: subtle.Primary
            },
            {
              customId: taskId ? `view_${taskId}` : 'view_noop',
              label: '상세보기',
              emoji: '📋',
              style: subtle.Secondary
            }
          ]
        },
        overdue: {
          primary: {
            customId: taskId ? `complete_${taskId}` : 'complete_noop',
            label: '완료 처리',
            emoji: '✅',
            style: subtle.Success
          },
          secondary: [
            {
              customId: taskId ? `extend_${taskId}` : 'extend_noop',
              label: '기한 연장',
              emoji: '⏳',
              style: subtle.Primary
            },
            {
              customId: taskId ? `share_${taskId}` : 'share_noop',
              label: '상황 공유',
              emoji: '📝',
              style: subtle.Secondary
            }
          ]
        },
        completed: {
          primary: {
            customId: taskId ? `confirm_${taskId}` : 'confirm_noop',
            label: '완료 확인',
            emoji: '🎉',
            style: subtle.Success
          },
          secondary: [
            {
              customId: taskId ? `next_task_${taskId}` : 'next_task_noop',
              label: '다음 업무',
              emoji: '➡️',
              style: subtle.Primary
            },
            {
              customId: taskId ? `share_${taskId}` : 'share_noop',
              label: '성과 공유',
              emoji: '📊',
              style: subtle.Secondary
            }
          ]
        },
        general: {
          primary: {
            customId: taskId ? `complete_${taskId}` : 'complete_noop',
            label: '완료',
            emoji: '✅',
            style: subtle.Success
          },
          secondary: [
            {
              customId: taskId ? `extend_${taskId}` : 'extend_noop',
              label: '연장',
              emoji: '⏰',
              style: subtle.Primary
            },
            {
              customId: taskId ? `view_${taskId}` : 'view_noop',
              label: '상세보기',
              emoji: '📋',
              style: subtle.Secondary
            }
          ]
        }
      };

      const config = buttonConfigs[notificationType] || buttonConfigs.general;
      
      // 첫 번째 행: 주요 액션 버튼
      const primaryRow = new this.discordJS.ActionRowBuilder()
        .addComponents(
          new this.discordJS.ButtonBuilder()
            .setCustomId(config.primary.customId)
            .setLabel(config.primary.label)
            .setEmoji(config.primary.emoji)
            .setStyle(config.primary.style)
        );

      // 두 번째 행: 보조 액션 버튼들
      const secondaryRow = new this.discordJS.ActionRowBuilder()
        .addComponents(
          config.secondary.map(btn => 
            new this.discordJS.ButtonBuilder()
              .setCustomId(btn.customId)
              .setLabel(btn.label)
              .setEmoji(btn.emoji)
              .setStyle(btn.style)
          )
        );

      const channel = await this.client.channels.fetch(channelId);
      if (channel && channel.isTextBased()) {
        await channel.send({ 
          embeds: [embed], 
          components: [primaryRow, secondaryRow] 
        });
      }
    } catch (error) {
      console.error('Discord 알림 발송 오류:', error);
      throw error;
    }
  }

  /**
   * 봇 상태 확인
   */
  isBotReady(): boolean {
    return this.isReady;
  }

  /**
   * 봇 종료
   */
  async stop(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
    }
  }
}

// 싱글톤 인스턴스
let discordBotService: DiscordBotService | null = null;

export function getDiscordBotService(): DiscordBotService | null {
  return discordBotService;
}

export async function initializeDiscordBot(): Promise<DiscordBotService | null> {
  if (!process.env.DISCORD_BOT_TOKEN || !process.env.DISCORD_CLIENT_ID) {
    return null;
  }

  if (discordBotService) {
    return discordBotService;
  }

  try {
    discordBotService = new DiscordBotService();
    await discordBotService.start();
    return discordBotService;
  } catch (error) {
    console.error('Discord 봇 초기화 실패:', error);
    return null;
  }
}