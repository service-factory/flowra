# Flowra 프론트엔드 개발 명세서

## 1. 프로젝트 개요

### 1.1 프로젝트 정보
- **프로젝트명**: Flowra
- **목적**: 사이드 프로젝트 팀의 효율적 일정 관리 및 업무 관리 체계 구축
- **기술 스택**: Next.js 14 + TypeScript, Module CSS, shadcn/ui
- **배포**: Vercel

### 1.2 핵심 기능
- 업무 생성 및 관리
- 일정 관리 및 알림
- 진행 상황 확인
- 업무 완료 처리
- 디스코드 연동

## 2. 기술 스택 및 아키텍처

### 2.1 프론트엔드 기술 스택
```
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Module CSS + shadcn/ui
- State Management: Zustand (또는 React Context)
- HTTP Client: Axios 또는 fetch
- Form Handling: React Hook Form + Zod
- Date Handling: date-fns
- Icons: Lucide React
```

### 2.2 프로젝트 구조
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── dashboard/         # 대시보드
│   ├── tasks/             # 업무 관리
│   ├── settings/          # 설정
│   └── layout.tsx         # 루트 레이아웃
├── components/            # 재사용 가능한 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── forms/            # 폼 컴포넌트
│   ├── charts/           # 차트 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── lib/                  # 유틸리티 및 설정
│   ├── utils.ts          # 공통 유틸리티
│   ├── validations.ts    # 폼 검증 스키마
│   └── api.ts            # API 클라이언트
├── hooks/                # 커스텀 훅
├── store/                # 상태 관리
├── types/                # TypeScript 타입 정의
└── styles/               # 전역 스타일
```

## 3. 페이지 및 라우팅 구조

### 3.1 라우팅 구조
```
/                          # 랜딩 페이지 (팀 선택 포함)
/auth                      # 인증 관련 페이지
  /login                   # 소셜 로그인 선택
  /callback                # OAuth 콜백 처리
/dashboard                 # 메인 대시보드 (팀 ID 파라미터)
/tasks                     # 업무 목록 (팀 ID 파라미터)
/tasks/[id]               # 업무 상세
/tasks/create             # 업무 생성
/calendar                  # 캘린더 뷰 (팀 ID 파라미터)
/team                      # 팀 관리 (팀 ID 파라미터)
/settings                  # 설정
/settings/profile          # 프로필 설정
/settings/notifications    # 알림 설정
/settings/appearance       # 외관 설정
/settings/team             # 팀 설정
/discord                   # 디스코드 연동 설정
/team/invite/[id]         # 팀 초대 수락
```

### 3.2 페이지별 상세 명세

#### 3.2.1 랜딩 페이지 (/)
- **목적**: 서비스 소개 및 팀 선택 유도
- **구성요소**:
  - Hero Section (서비스 소개)
  - 주요 기능 소개
  - 사용자 후기/통계
  - CTA 버튼 (팀 선택 모달)
  - 팀 선택 인터페이스 (로그인 후)
  - 팀 생성/참여 옵션

#### 3.2.2 소셜 로그인 페이지 (/auth/login)
- **목적**: 소셜 로그인 제공자 선택
- **구성요소**:
  - 카카오 로그인 버튼
  - 구글 로그인 버튼
  - 서비스 이용약관 및 개인정보처리방침 링크
  - 로그인 후 리다이렉트 처리

#### 3.2.3 대시보드 (/dashboard?teamId=)
- **목적**: 팀 전체 업무 현황 한눈에 확인
- **구성요소**:
  - 팀 선택 헤더
  - 업무 상태별 통계 카드
  - 마감일 임박 업무 목록
  - 진행 중인 업무 목록
  - 최근 활동 피드
  - 팀원별 업무 현황 차트
  - Discord 연동 상태
  - 빠른 액션 버튼

#### 3.2.4 업무 목록 (/tasks?teamId=)
- **목적**: 모든 업무를 필터링하여 관리
- **구성요소**:
  - 팀 선택 헤더
  - 필터 및 검색 바
  - 칸반 보드/리스트 뷰 전환
  - 업무 목록 테이블/카드 뷰
  - 정렬 옵션 (마감일, 우선순위, 상태)
  - 페이지네이션
  - 업무 생성 버튼
  - 드래그 앤 드롭 지원

#### 3.2.5 업무 상세 (/tasks/[id])
- **목적**: 개별 업무의 상세 정보 확인 및 수정
- **구성요소**:
  - 업무 기본 정보
  - 진행 상황 히스토리
  - 댓글/메모 섹션
  - 첨부파일 관리
  - 상태 변경 버튼
  - 의존성 설정

#### 3.2.6 업무 생성 (/tasks/create)
- **목적**: 새로운 업무 생성
- **구성요소**:
  - 팀 선택
  - 프로젝트 선택
  - 업무 제목 입력
  - 설명 입력 (마크다운 지원)
  - 담당자 선택
  - 마감일 설정
  - 우선순위 설정
  - 태그 설정
  - 의존성 설정

#### 3.2.7 캘린더 뷰 (/calendar?teamId=)
- **목적**: 업무 일정을 캘린더 형태로 시각화
- **구성요소**:
  - 월/주/일 뷰 전환
  - 드래그 앤 드롭으로 일정 조정
  - 업무 상태별 색상 구분
  - 마감일 알림 표시

#### 3.2.8 팀 관리 (/team?teamId=)
- **목적**: 팀원 관리 및 팀 설정
- **구성요소**:
  - 팀원 목록 및 역할 관리
  - 팀원 초대 기능
  - 팀 설정 변경
  - 팀 통계 및 분석

#### 3.2.9 설정 페이지 (/settings)
- **목적**: 개인 및 팀 설정 관리
- **구성요소**:
  - 프로필 설정
  - 알림 설정
  - 외관 설정 (다크 모드)
  - 팀 설정
  - Discord 연동 설정

## 4. 컴포넌트 설계

### 4.1 UI 컴포넌트 (shadcn/ui 기반)
```
- Button
- Input
- Textarea
- Select
- DatePicker
- Calendar
- Card
- Badge
- Progress
- Tabs
- Dialog
- Sheet
- Table
- Form
- Toast
- Avatar
- DropdownMenu
- Checkbox
- RadioGroup
- Switch
```

### 4.2 비즈니스 컴포넌트
```
- TaskCard: 업무 카드 컴포넌트
- TaskList: 업무 목록 컴포넌트
- TaskForm: 업무 생성/수정 폼
- StatusBadge: 상태 표시 배지
- PriorityIndicator: 우선순위 표시
- UserAvatar: 사용자 아바타
- DateRangePicker: 날짜 범위 선택
- FilterBar: 필터링 바
- SearchInput: 검색 입력
- Pagination: 페이지네이션
- LoadingSpinner: 로딩 스피너
- EmptyState: 빈 상태 표시
- TeamSelector: 팀 선택 컴포넌트
- TeamSelectModal: 팀 선택 모달
- KanbanBoard: 칸반 보드 컴포넌트
- CalendarView: 캘린더 뷰 컴포넌트
- DiscordIntegration: Discord 연동 컴포넌트
- NotificationBell: 알림 벨 컴포넌트
- TaskDetailDrawer: 업무 상세 드로어
- ViewModeSelector: 뷰 모드 선택기
```

### 4.3 레이아웃 컴포넌트
```
- Header: 상단 헤더
- Sidebar: 사이드바 네비게이션
- Footer: 하단 푸터
- PageLayout: 페이지 레이아웃
- AuthLayout: 인증 페이지 레이아웃
```

## 5. 상태 관리

### 5.1 전역 상태 구조
```typescript
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    provider: 'kakao' | 'google' | null;
  };
  tasks: {
    items: Task[];
    filters: TaskFilters;
    pagination: PaginationState;
    isLoading: boolean;
  };
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Notification[];
  };
  team: {
    members: TeamMember[];
    currentProject: Project | null;
  };
}
```

### 5.2 상태 관리 전략
- **Zustand**: 전역 상태 관리
- **React Query**: 서버 상태 관리 및 캐싱
- **Local Storage**: 사용자 설정 저장
- **Session Storage**: 임시 데이터 저장

## 6. API 통신

### 6.1 API 엔드포인트 구조
```typescript
// 인증
GET  /api/auth/callback/kakao
GET  /api/auth/callback/google
POST /api/auth/logout
GET  /api/auth/me

// 업무 관리
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/[id]
PUT    /api/tasks/[id]
DELETE /api/tasks/[id]
PATCH  /api/tasks/[id]/status

// 팀 관리
GET  /api/team/members
POST /api/team/members
PUT  /api/team/members/[id]

// 알림
GET  /api/notifications
POST /api/notifications/mark-read

// 디스코드 연동
POST /api/discord/connect
GET  /api/discord/status
```

### 6.2 데이터 타입 정의
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: User;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  comments: Comment[];
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'kakao' | 'google';
  role: 'admin' | 'member';
}

interface TeamMember extends User {
  joinedAt: Date;
  isActive: boolean;
}
```

## 7. 스타일링 가이드

### 7.1 디자인 시스템
- **색상 팔레트**: shadcn/ui 기본 색상 시스템 활용
- **타이포그래피**: Inter 폰트 사용
- **간격**: 4px 단위 시스템 (4, 8, 12, 16, 24, 32, 48, 64px)
- **둥근 모서리**: 4px, 8px, 12px, 16px
- **그림자**: 3단계 그림자 시스템

### 7.2 반응형 디자인
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### 7.3 다크 모드 지원
- CSS 변수를 활용한 테마 시스템
- 사용자 설정에 따른 자동 전환

## 8. 성능 최적화

### 8.1 코드 분할
- 페이지별 동적 임포트
- 컴포넌트별 지연 로딩
- 번들 크기 최적화

### 8.2 캐싱 전략
- React Query를 활용한 서버 상태 캐싱
- 이미지 최적화 (Next.js Image 컴포넌트)
- 정적 자산 캐싱

### 8.3 SEO 최적화
- 메타데이터 설정
- 구조화된 데이터
- 사이트맵 생성

## 9. 접근성 (A11y)

### 9.1 키보드 네비게이션
- 모든 인터랙티브 요소에 키보드 접근 가능
- 포커스 표시기 명확히 표시
- Tab 순서 논리적 구성

### 9.2 스크린 리더 지원
- 의미있는 HTML 시맨틱 태그 사용
- ARIA 레이블 및 설명 추가
- 대체 텍스트 제공

## 10. 테스트 전략

### 10.1 테스트 유형
- **Unit Test**: Jest + React Testing Library
- **Integration Test**: 컴포넌트 통합 테스트
- **E2E Test**: Playwright
- **Visual Test**: Storybook + Chromatic

### 10.2 테스트 커버리지 목표
- 컴포넌트 테스트: 90% 이상
- 유틸리티 함수: 95% 이상
- 통합 테스트: 80% 이상

## 11. 개발 체크리스트

### 11.1 프로젝트 초기 설정
- [x] Next.js 14 프로젝트 생성
- [x] TypeScript 설정
- [x] ESLint + Prettier 설정
- [x] shadcn/ui 설치 및 설정
- [x] 프로젝트 폴더 구조 생성
- [x] 환경 변수 설정
- [x] Git 저장소 초기화

### 11.2 기본 레이아웃 및 네비게이션
- [x] 루트 레이아웃 컴포넌트 구현
- [x] 헤더 컴포넌트 구현
- [x] 사이드바 네비게이션 구현
- [x] 반응형 레이아웃 구현
- [x] 다크 모드 토글 기능
- [x] 로딩 상태 처리

### 11.3 인증 시스템
- [x] 소셜 로그인 페이지 구현 (카카오, 구글)
- [x] OAuth 콜백 처리 구현
- [x] 인증 상태 관리 (Zustand)
- [x] 보호된 라우트 구현
- [x] 로그아웃 기능
- [x] 소셜 로그인 연동 테스트

### 11.4 대시보드 페이지
- [x] 대시보드 레이아웃 구현
- [x] 업무 상태 통계 카드 구현
- [x] 마감일 임박 업무 목록 구현
- [x] 진행 중인 업무 목록 구현
- [x] 최근 활동 피드 구현
- [x] 팀원별 업무 현황 차트 구현
- [x] 실시간 데이터 업데이트

### 11.5 업무 관리 기능
- [x] 업무 목록 페이지 구현
- [x] 업무 카드 컴포넌트 구현
- [x] 업무 상세 페이지 구현
- [x] 업무 생성 폼 구현
- [x] 업무 수정 기능 구현
- [x] 업무 삭제 기능 구현
- [x] 업무 상태 변경 기능
- [x] 업무 필터링 및 검색 기능
- [x] 페이지네이션 구현

### 11.6 폼 및 입력 처리
- [x] React Hook Form 설정
- [x] Zod 검증 스키마 작성
- [x] 폼 컴포넌트 구현
- [x] 에러 처리 및 표시
- [x] 로딩 상태 처리
- [x] 성공/실패 피드백

### 11.7 API 통신
- [x] API 클라이언트 설정 (customFetch)
- [x] React Query 설정
- [x] 인증 토큰 관리
- [x] 에러 핸들링
- [x] 로딩 상태 관리
- [x] 캐싱 전략 구현

### 11.8 상태 관리
- [x] Zustand 스토어 설정
- [x] 인증 상태 관리
- [x] 업무 상태 관리
- [x] UI 상태 관리
- [x] 팀 상태 관리
- [x] 로컬 스토리지 연동

### 11.9 스타일링
- [x] shadcn/ui 컴포넌트 커스터마이징
- [x] 모듈 CSS 설정
- [x] 반응형 디자인 구현
- [x] 다크 모드 스타일링
- [x] 애니메이션 및 트랜지션
- [x] 접근성 스타일링

### 11.10 성능 최적화
- [x] 코드 분할 구현
- [x] 이미지 최적화
- [x] 번들 크기 최적화
- [x] 캐싱 전략 구현
- [x] 지연 로딩 구현
- [x] 성능 모니터링 설정

### 11.11 테스트
- [ ] Jest 설정
- [ ] React Testing Library 설정
- [ ] 컴포넌트 단위 테스트 작성
- [ ] 유틸리티 함수 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 설정 (Playwright)
- [ ] 테스트 커버리지 확인

### 11.12 접근성
- [x] 키보드 네비게이션 구현
- [x] ARIA 레이블 추가
- [x] 스크린 리더 테스트
- [x] 색상 대비 확인
- [x] 포커스 관리
- [x] 접근성 검사 도구 실행

### 11.13 배포 준비
- [x] 환경 변수 설정
- [x] 빌드 최적화
- [x] Vercel 배포 설정
- [ ] 도메인 설정
- [ ] SSL 인증서 설정
- [ ] 모니터링 설정

### 11.14 문서화
- [x] README.md 작성
- [x] API 문서 작성
- [x] 컴포넌트 문서 작성 (Storybook)
- [x] 배포 가이드 작성
- [x] 개발 가이드 작성

### 11.15 품질 보증
- [ ] 코드 리뷰
- [ ] 성능 테스트
- [ ] 보안 검사
- [ ] 크로스 브라우저 테스트
- [ ] 모바일 테스트
- [ ] 사용자 테스트

## 12. 개발 일정 (예상)

### Phase 1: 기반 설정 (1주)
- 프로젝트 초기 설정
- 기본 레이아웃 구현
- 소셜 로그인 인증 시스템 구현

### Phase 2: 핵심 기능 (2주)
- 대시보드 구현
- 업무 관리 기능 구현
- API 통신 구현

### Phase 3: 고도화 (1주)
- 성능 최적화
- 테스트 작성
- 접근성 개선

### Phase 4: 배포 및 검증 (0.5주)
- 배포 설정
- 사용자 테스트
- 버그 수정

## 13. 위험 요소 및 대응 방안

### 13.1 기술적 위험
- **Next.js 14 호환성**: 최신 버전 사용으로 인한 호환성 문제
  - 대응: 안정적인 버전으로 롤백 준비
- **shadcn/ui 커스터마이징**: 디자인 요구사항과의 차이
  - 대응: CSS 모듈을 통한 추가 스타일링

### 13.2 일정 위험
- **기능 범위 확장**: 개발 중 요구사항 변경
  - 대응: MVP 기능 우선 개발, 추가 기능은 후속 버전으로

### 13.3 성능 위험
- **대용량 데이터 처리**: 업무 데이터 증가 시 성능 저하
  - 대응: 페이지네이션, 가상화, 캐싱 전략 적용

## 14. 참고 자료

### 14.1 기술 문서
- [Next.js 14 공식 문서](https://nextjs.org/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod 검증 라이브러리](https://zod.dev/)

### 14.2 디자인 참고
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)

---

**문서 버전**: 1.0  
**작성일**: 2024년 12월  
**최종 수정일**: 2024년 12월  
**작성자**: 개발팀
