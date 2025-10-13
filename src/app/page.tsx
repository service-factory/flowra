"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

import { LandingPage } from "@/components/landing";
import { LoginModal } from "@/components/login-modal";
import TeamInviteModal from "@/components/team-invite-modal";
import TeamCreateModal from "@/components/team-create-modal";
import TeamSelectModal from "@/components/team-select-modal";
import useAuth from "@/hooks/useAuth";

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamInviteModalOpen, setIsTeamInviteModalOpen] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTeamSelectModalOpen, setIsTeamSelectModalOpen] = useState(false);
  const [shouldOpenTeamSelect, setShouldOpenTeamSelect] = useState(false);
  const [shouldAutoOpenTeamSelect, setShouldAutoOpenTeamSelect] = useState(false);
  const { isAuthenticated, isLoading, refreshTeamData } = useAuth();
  const hasProcessedOAuth = useRef(false);

  // OAuth 콜백 처리 (code exchange) - 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // 이미 처리했으면 스킵
      if (hasProcessedOAuth.current) return;

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const autoProcess = params.get('autoProcess');
      
      // OAuth code가 있으면 처리
      if (code) {
        hasProcessedOAuth.current = true;
        
        try {
          const supabase = createClient();
          
          // Code를 세션으로 교환
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('OAuth code exchange 실패:', error);
            alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          } else {
            console.log('OAuth 로그인 성공');
            
            // autoProcess가 true면 나중에 팀 선택 모달 열기
            if (autoProcess === 'true') {
              setShouldAutoOpenTeamSelect(true);
            }
          }
        } catch (error) {
          console.error('OAuth 처리 중 오류:', error);
          alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
        } finally {
          // URL에서 OAuth 관련 파라미터 제거
          params.delete('code');
          params.delete('autoProcess');
          const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
          window.history.replaceState({}, '', newUrl);
        }
      }
    };

    handleOAuthCallback();
  }, []); // 빈 배열로 마운트 시 한 번만 실행

  // OAuth 처리 완료 후 자동으로 팀 선택 모달 열기
  useEffect(() => {
    if (shouldAutoOpenTeamSelect && isAuthenticated && !isLoading) {
      setShouldAutoOpenTeamSelect(false);
      setIsTeamSelectModalOpen(true);
    }
  }, [shouldAutoOpenTeamSelect, isAuthenticated, isLoading]);

  const handleGetStarted = () => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      setShouldOpenTeamSelect(true);
      setIsLoginModalOpen(true);
      return;
    }

    setIsTeamSelectModalOpen(true);
  };

  useEffect(() => {
    if (shouldOpenTeamSelect && isAuthenticated) {
      setShouldOpenTeamSelect(false);
      setIsLoginModalOpen(false);
      setIsTeamSelectModalOpen(true);
    }
  }, [shouldOpenTeamSelect, isAuthenticated]);

  return (
    <div className="min-h-screen">
      {/* New Landing Page */}
      <LandingPage onGetStarted={handleGetStarted} />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setShouldOpenTeamSelect(false);
        }}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          setShouldOpenTeamSelect(false);
          setIsTeamSelectModalOpen(true);
        }}
      />

      <TeamInviteModal
        isOpen={isTeamInviteModalOpen}
        onClose={() => setIsTeamInviteModalOpen(false)}
        onInvite={(invitations) => {
          console.log('팀 초대:', invitations);
        }}
      />

      <TeamCreateModal
        isOpen={isTeamCreateModalOpen}
        onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async () => {
          await refreshTeamData();
          window.location.href = '/dashboard?teamId=0';
        }}
      />

      <TeamSelectModal
        isOpen={isTeamSelectModalOpen}
        onClose={() => setIsTeamSelectModalOpen(false)}
        redirectPath="/dashboard"
      />
    </div>
  );
};

export default Home;
