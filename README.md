# Flowra - 팀 협업 프로젝트 관리 도구

Flowra는 Supabase를 기반으로 한 현대적인 팀 협업 프로젝트 관리 도구입니다.

## 주요 기능

- 🔐 Supabase OAuth 인증 (카카오, 구글)
- 📋 태스크 관리 (칸반 보드, 리스트 뷰)
- 👥 팀 관리 및 이메일 멤버 초대
- 📊 프로젝트 진행 상황 추적
- 🔔 실시간 알림 시스템
- 📱 반응형 디자인

## 기술 스택

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: Tailwind CSS, shadcn/ui
- **State Management**: Zustand
- **Authentication**: Supabase Auth with OAuth
- **Email Service**: Resend
- **Data Fetching**: TanStack Query

## 시작하기

### 0. 개발 환경 최적화 (ENOENT 에러 방지)

ENOENT 에러를 방지하기 위해 개발 환경을 최적화합니다:

```bash
# 자동 최적화 스크립트 실행
./scripts/setup-dev.sh

# 또는 수동으로 실행
npm run dev:clean
```

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Email Service (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@resend.dev  # 테스트용 (개발 모드에서는 콘솔 출력)
# RESEND_FROM_EMAIL=noreply@yourdomain.com  # 프로덕션용 (도메인 인증 필요)

# OAuth Providers (Supabase Dashboard에서 설정)
# Kakao OAuth
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Resend 이메일 서비스 설정

팀 초대 이메일을 발송하기 위해 Resend 서비스를 설정해야 합니다:

1. [Resend](https://resend.com)에 가입
2. API 키 생성
3. 도메인 인증 (선택사항, 개발 시에는 기본 도메인 사용 가능)
4. `.env.local`에 API 키와 발신 이메일 설정

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com  # 또는 noreply@resend.dev
```

### 3. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성하세요.
2. 프로젝트 설정에서 OAuth 제공자를 설정하세요:
   - **카카오**: [카카오 개발자 콘솔](https://developers.kakao.com)에서 앱을 생성하고 OAuth 설정
   - **구글**: [Google Cloud Console](https://console.cloud.google.com)에서 OAuth 2.0 클라이언트 ID 생성
3. Supabase Dashboard > Authentication > Providers에서 OAuth 설정을 완료하세요.

### 4. 데이터베이스 설정

Supabase SQL Editor에서 다음 SQL을 실행하여 필요한 테이블을 생성하세요:

```sql
-- Users 테이블 (Supabase Auth와 연동)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  discord_id TEXT,
  timezone TEXT DEFAULT 'Asia/Seoul',
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 추가 테이블들 (teams, projects, tasks 등)은 기존 스키마 참조
```

### 5. 이메일 서비스 설정 (Resend)

#### 개발 모드

개발 환경에서는 이메일이 실제로 발송되지 않고 콘솔에 출력됩니다:

```
📧 [개발 모드] 이메일 발송 시뮬레이션:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 받는 사람: user@example.com
📋 제목: 팀명 팀에 초대되었습니다
👤 초대자: 홍길동
🏢 팀: 개발팀
🎭 역할: member
🔗 초대 링크: http://localhost:3000/team/invite/invitation-id
⏰ 만료일: 2024-09-26 14:37:37
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### 프로덕션 모드

프로덕션에서는 실제 이메일이 발송됩니다. 다음 단계를 따라 설정하세요:

1. [Resend](https://resend.com)에서 계정 생성
2. 도메인 인증 (필수)
3. API 키 발급
4. 환경 변수 설정:
   ```env
   RESEND_API_KEY=re_xxxxxxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com  # 인증된 도메인 사용
   ```

### 6. 개발 서버 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 애플리케이션을 확인할 수 있습니다.

## 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   └── auth/          # 인증 관련 API
│   ├── auth/              # 인증 페이지
│   ├── dashboard/         # 대시보드
│   ├── tasks/             # 태스크 관리
│   └── team/              # 팀 관리
├── components/            # 재사용 가능한 컴포넌트
│   └── ui/               # UI 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   └── supabase/         # Supabase 클라이언트
├── store/                # 상태 관리 (Zustand)
└── types/                # TypeScript 타입 정의
```

## 배포

### Vercel 배포

1. GitHub에 코드를 푸시하세요.
2. [Vercel](https://vercel.com)에서 프로젝트를 연결하세요.
3. 환경 변수를 설정하세요.
4. 배포를 완료하세요.

### Supabase 프로덕션 설정

1. Supabase 프로젝트 설정에서 프로덕션 URL과 키를 확인하세요.
2. OAuth 리다이렉트 URL을 프로덕션 도메인으로 업데이트하세요.
3. 환경 변수를 프로덕션 값으로 설정하세요.

## 라이선스

MIT License
