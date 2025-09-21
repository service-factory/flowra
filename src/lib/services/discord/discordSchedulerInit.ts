/**
 * Discord 스케줄러 자동 초기화
 * 서버 시작 시 자동으로 Discord 스케줄러를 시작합니다.
 */

let isInitialized = false;

export async function initializeDiscordScheduler() {
  if (isInitialized) {
    return;
  }

  try {
    // Discord 웹훅 스케줄러 클래스 동적 import
    const { DiscordWebhookScheduler } = await import('./discordWebhookScheduler');
    
    // 새로운 인스턴스 생성
    const scheduler = new DiscordWebhookScheduler();
    
    // 스케줄러 시작
    scheduler.start();
    
    isInitialized = true;
    
  } catch (error) {
    console.error('❌ Discord 스케줄러 초기화 오류:', error);
    console.error('스택 트레이스:', error);
  }
}
