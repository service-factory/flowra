-- Discord 봇 설정을 위한 컬럼 추가
ALTER TABLE teams ADD COLUMN IF NOT EXISTS discord_guild_id TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS discord_channel_id TEXT;

-- Discord 사용자 매핑을 위한 테이블 생성
CREATE TABLE IF NOT EXISTS discord_user_mappings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  discord_user_id TEXT NOT NULL,
  discord_username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id),
  UNIQUE(team_id, discord_user_id)
);

-- RLS 정책 추가
ALTER TABLE discord_user_mappings ENABLE ROW LEVEL SECURITY;

-- 팀 멤버만 매핑을 조회/수정할 수 있도록 정책 설정
CREATE POLICY "팀 멤버는 Discord 사용자 매핑을 조회할 수 있습니다" ON discord_user_mappings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = discord_user_mappings.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "팀 멤버는 Discord 사용자 매핑을 생성할 수 있습니다" ON discord_user_mappings
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = discord_user_mappings.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

CREATE POLICY "팀 멤버는 자신의 Discord 사용자 매핑을 수정할 수 있습니다" ON discord_user_mappings
  FOR UPDATE USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_members.team_id = discord_user_mappings.team_id 
      AND team_members.user_id = auth.uid()
    )
  );

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_discord_user_mappings_user_id ON discord_user_mappings(user_id);
CREATE INDEX IF NOT EXISTS idx_discord_user_mappings_team_id ON discord_user_mappings(team_id);
CREATE INDEX IF NOT EXISTS idx_discord_user_mappings_discord_user_id ON discord_user_mappings(discord_user_id);

-- 팀 테이블에 Discord 설정 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_teams_discord_guild_id ON teams(discord_guild_id);
CREATE INDEX IF NOT EXISTS idx_teams_discord_channel_id ON teams(discord_channel_id);
