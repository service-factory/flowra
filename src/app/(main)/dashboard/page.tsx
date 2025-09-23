"use client";

import { useState } from "react";
import { TeamCreateModal } from "@/components/team-create-modal";
import { TeamGuard } from "@/components/team-guard";
import { DiscordOnboarding } from "@/components/discord-onboarding";
import { useDashboardData } from "./hooks/useDashboardData";
import { WelcomeSection } from "./components/WelcomeSection";
import { StatsCards } from "./components/StatsCards";
import { RecentTasks } from "./components/RecentTasks";
import { TeamProgress } from "./components/TeamProgress";
import { RecentActivityComponent } from "./components/RecentActivity";
import { DiscordIntegration } from "./components/DiscordIntegration";
import { QuickActions } from "./components/QuickActions";

export default function Dashboard() {
  const [isTeamCreateModalOpen, setIsTeamCreateModalOpen] = useState(false);
  const [isTaskCreateOpen, setIsTaskCreateOpen] = useState(false);
  
  const {
    stats,
    filteredTasks,
    discordStatus,
    teamData,
    isLoading,
    refreshTeamData,
    currentTeam,
    recentActivity
  } = useDashboardData();


  return (
    <TeamGuard>
      <div>
        <WelcomeSection />
        
        <StatsCards stats={stats} isLoading={isLoading} />
        
          {!discordStatus.connected && (
            <div className="mb-8">
              <DiscordOnboarding />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <RecentTasks 
            filteredTasks={filteredTasks}
            teamData={teamData}
                    isLoading={isLoading}
            currentTeamId={currentTeam?.id}
            isTaskCreateOpen={isTaskCreateOpen}
            onTaskCreateOpenChange={setIsTaskCreateOpen}
          />

            <div className="space-y-6">
            <TeamProgress stats={stats} />
            
            <RecentActivityComponent activities={recentActivity} isLoading={isLoading} />
            
            {!discordStatus.connected && (
              <DiscordIntegration discordStatus={discordStatus} />
            )}
            
            <QuickActions onTaskCreate={() => {}} />
            </div>
          </div>
      </div>

    <TeamCreateModal 
      isOpen={isTeamCreateModalOpen} 
      onClose={() => setIsTeamCreateModalOpen(false)}
        onCreate={async (teamData) => {
          console.log('팀 생성:', teamData);
          // 팀 생성 성공 시 팀 정보 새로고침
          await refreshTeamData();
          // tasks 페이지로 이동
          window.location.href = '/tasks?teamId=0';
        }}
    />
    </TeamGuard>
  );
}
