'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getFetch, postFetch } from '@/lib/requests/customFetch';

interface InvitationData {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  message?: string;
  status: string;
  expiresAt: string;
  team: {
    id: string;
    name: string;
    slug?: string;
  };
  inviter: {
    name: string;
    email: string;
  };
}

export default function TeamInvitePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invitationId = params?.invitationId as string;
  const email = searchParams?.get('email');

  const roleNames = {
    admin: '관리자',
    member: '멤버',
    viewer: '뷰어'
  };

  const loadInvitation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 초대 정보 조회 API 호출
      const response = await getFetch<undefined, { success: boolean; data?: InvitationData; error?: string }>({
        url: `/api/teams/invitations/${invitationId}?email=${encodeURIComponent(email!)}`
      });

      if (response.success && response.data) {
        setInvitation(response.data as InvitationData);
      } else {
        setError(response.error || '초대 정보를 불러올 수 없습니다');
      }
    } catch (err) {
      console.error('초대 정보 로드 실패:', err);
      setError('초대 정보를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  }, [invitationId, email]);

  // 초대 정보 로드
  useEffect(() => {
    if (!invitationId || !email) {
      setError('잘못된 초대 링크입니다');
      setLoading(false);
      return;
    }

    loadInvitation();
  }, [invitationId, email, loadInvitation]);

  const handleAcceptInvitation = async () => {
    if (!user || !invitation || !email) {
      setError('로그인이 필요합니다');
      return;
    }

    if (user.email !== email) {
      setError('초대받은 이메일과 로그인한 계정이 일치하지 않습니다');
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      const response = await postFetch<{ email: string }, { success: boolean; data?: { redirectUrl?: string }; error?: string }>({
        url: `/api/teams/invitations/${invitationId}/accept`,
        body: { email }
      });

      if (response.success && response.data) {
        // 성공 시 팀 페이지로 리다이렉트
        const redirectUrl = response.data.redirectUrl || `/team/${invitation.team.slug || invitation.team.id}`;
        router.push(redirectUrl);
      } else {
        setError(response.error || '초대 수락에 실패했습니다');
      }
    } catch (err) {
      console.error('초대 수락 실패:', err);
      setError('초대 수락 중 오류가 발생했습니다');
    } finally {
      setAccepting(false);
    }
  };

  const handleDeclineInvitation = async () => {
    // 초대 거절 기능은 나중에 구현
    setError('초대 거절 기능은 준비 중입니다');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">초대 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">오류가 발생했습니다</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h1>
            <p className="text-gray-600 mb-6">팀 초대를 수락하려면 먼저 로그인해주세요.</p>
            <Button
              onClick={() => router.push(`/?login=true&redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
              className="w-full"
            >
              로그인하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">초대 정보를 확인하는 중...</p>
        </div>
      </div>
    );
  }

  const isExpired = new Date() > new Date(invitation.expiresAt);
  const isAlreadyProcessed = invitation.status !== 'pending';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          {/* 로고 */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-blue-600">F</span>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">팀 초대</h1>
          <p className="text-gray-600 mb-8">
            <span className="font-medium">{invitation.inviter.name}</span>님이 팀에 초대했습니다
          </p>
        </div>

        {/* 팀 정보 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">팀 정보</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">팀 이름:</span>
              <span className="font-medium">{invitation.team.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">역할:</span>
              <Badge variant="secondary">{roleNames[invitation.role]}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">초대자:</span>
              <span className="font-medium">{invitation.inviter.name}</span>
            </div>
          </div>
        </div>

        {/* 초대 메시지 */}
        {invitation.message && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-800 mb-2">초대 메시지</h4>
            <p className="text-yellow-700">{invitation.message}</p>
          </div>
        )}

        {/* 만료 경고 */}
        {isExpired && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">
              ⚠️ 이 초대는 만료되었습니다 ({new Date(invitation.expiresAt).toLocaleDateString('ko-KR')})
            </p>
          </div>
        )}

        {/* 이미 처리됨 경고 */}
        {isAlreadyProcessed && !isExpired && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-700 text-sm">
              이 초대는 이미 처리되었습니다 (상태: {invitation.status})
            </p>
          </div>
        )}

        {/* 이메일 불일치 경고 */}
        {user.email !== email && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <p className="text-orange-700 text-sm">
              ⚠️ 초대받은 이메일({email})과 로그인한 계정({user.email})이 일치하지 않습니다.
            </p>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Button
            onClick={handleAcceptInvitation}
            disabled={accepting || isExpired || isAlreadyProcessed || user.email !== email}
            className="w-full"
          >
            {accepting ? '처리 중...' : '초대 수락하기'}
          </Button>
          
          <Button
            onClick={handleDeclineInvitation}
            disabled={accepting || isExpired || isAlreadyProcessed}
            variant="outline"
            className="w-full"
          >
            초대 거절하기
          </Button>
        </div>

        {/* 만료 시간 */}
        {!isExpired && (
          <p className="text-center text-sm text-gray-500 mt-4">
            이 초대는 {new Date(invitation.expiresAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}까지 유효합니다.
          </p>
        )}
      </Card>
    </div>
  );
}
