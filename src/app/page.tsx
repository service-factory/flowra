"use client";

import { LandingPage } from "@/components/landing";
import { LoginModal } from "@/components/login-modal";
import TeamInviteModal from "@/components/team-invite-modal";
import TeamCreateModal from "@/components/team-create-modal";
import TeamSelectModal from "@/components/team-select-modal";
import useAuth from "@/hooks/useAuth";
import { useState } from "react";

const Home = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTeamInviteModalOpen, setIsTeamInviteModalOpen] = useState(false);
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTeamSelectModalOpen, setIsTeamSelectModalOpen] = useState(false);
  const { isAuthenticated, user, isLoading, hasTeam, refreshTeamData } = useAuth();

  return (
    <div className="min-h-screen">
      {/* New Landing Page */}
      <LandingPage />

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
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
