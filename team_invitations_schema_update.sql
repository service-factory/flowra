-- team_invitations 테이블 스키마 업데이트
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- message 컬럼 추가 (초대 메시지)
ALTER TABLE team_invitations 
ADD COLUMN IF NOT EXISTS message TEXT;

-- status 컬럼 추가 (초대 상태: pending, accepted, declined, cancelled, expired)
ALTER TABLE team_invitations 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- updated_at 컬럼 추가 (업데이트 시간)
ALTER TABLE team_invitations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- 기존 데이터의 status를 pending으로 설정
UPDATE team_invitations 
SET status = 'pending' 
WHERE status IS NULL;

-- 스키마 확인
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'team_invitations' 
ORDER BY ordinal_position;
