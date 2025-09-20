-- 알림 관련 테이블 스키마 확인

-- notifications 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notifications' 
ORDER BY ordinal_position;

-- notification_preferences 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'notification_preferences' 
ORDER BY ordinal_position;

-- 인덱스 정보 확인
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('notifications', 'notification_preferences');
