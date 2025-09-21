-- Discord 사용자 설정 테이블 생성
CREATE TABLE IF NOT EXISTS public.discord_user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_time TIME DEFAULT '09:00:00' NOT NULL,
    timezone TEXT DEFAULT 'Asia/Seoul' NOT NULL,
    reminder_enabled BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- 사용자당 하나의 설정만 허용
    UNIQUE(user_id)
);

-- RLS 정책 설정
ALTER TABLE public.discord_user_settings ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 설정만 볼 수 있음
CREATE POLICY "Users can view own discord settings" ON public.discord_user_settings
    FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 설정만 생성할 수 있음
CREATE POLICY "Users can insert own discord settings" ON public.discord_user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 설정만 업데이트할 수 있음
CREATE POLICY "Users can update own discord settings" ON public.discord_user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 설정만 삭제할 수 있음
CREATE POLICY "Users can delete own discord settings" ON public.discord_user_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_discord_user_settings_user_id ON public.discord_user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_user_settings_reminder_time ON public.discord_user_settings(reminder_time);
CREATE INDEX IF NOT EXISTS idx_discord_user_settings_timezone ON public.discord_user_settings(timezone);

-- updated_at 자동 업데이트를 위한 트리거
CREATE OR REPLACE FUNCTION update_discord_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_discord_user_settings_updated_at
    BEFORE UPDATE ON public.discord_user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_discord_user_settings_updated_at();

-- teams 테이블에 Discord 웹훅 URL 컬럼 추가 (이미 있다면 무시)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'teams' 
        AND column_name = 'discord_webhook_url'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.teams ADD COLUMN discord_webhook_url TEXT;
    END IF;
END $$;

-- Discord 웹훅 URL에 대한 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_teams_discord_webhook_url ON public.teams(discord_webhook_url) WHERE discord_webhook_url IS NOT NULL;
