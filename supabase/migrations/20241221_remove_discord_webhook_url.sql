-- Discord 웹훅 URL 컬럼 제거 (Discord 봇으로 전환)
-- teams 테이블에서 discord_webhook_url 컬럼 제거

-- 컬럼 제거
ALTER TABLE teams DROP COLUMN IF EXISTS discord_webhook_url;

-- 변경 사항 확인을 위한 로그
DO $$
BEGIN
    RAISE NOTICE 'Discord 웹훅 URL 컬럼이 성공적으로 제거되었습니다.';
    RAISE NOTICE 'Discord 봇 설정 컬럼들(discord_guild_id, discord_channel_id)은 유지됩니다.';
END $$;
