-- Discord 관련 unique 제약 제거
-- discord_guild_id의 unique 제약 제거
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_discord_guild_id_key;

-- discord_channel_id에 unique 제약이 있다면 제거 (현재는 없는 것 같지만 확인)
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_discord_channel_id_key;
