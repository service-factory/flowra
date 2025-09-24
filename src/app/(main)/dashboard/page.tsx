"use client";

import TeamGuard from "@/components/team-guard";
import { DiscordOnboarding } from "@/components/discord-onboarding";
import useAuth from "@/hooks/useAuth";

import { useDashboardData } from "./hooks/useDashboardData";
import { WelcomeSection } from "./components/WelcomeSection";
import { StatsCards } from "./components/StatsCards";
import { ProductivityInsights } from "./components/ProductivityInsights";

export default function Dashboard() {
  const { user } = useAuth();

  const {
    stats,
    discordStatus,
    teamData,
    isLoading,
    currentTeam,
  } = useDashboardData();

  return (
    <TeamGuard>
      <div className="space-y-8">
        {/* 개선된 환영 섹션 */}
        <WelcomeSection
          stats={stats}
          currentTeam={currentTeam}
          userName={user?.name || user?.email || "사용자"}
          isLoading={isLoading}
        />

        {/* 개선된 통계 카드 */}
        <StatsCards stats={stats} isLoading={isLoading} />

        {/* 생산성 인사이트 - 새로운 컴포넌트 */}
        <ProductivityInsights
          stats={stats}
          tasks={teamData?.tasks || []}
          isLoading={isLoading}
        />

        {/* Discord 온보딩 (필요시) */}
        {!discordStatus.connected && (
          <div>
            <DiscordOnboarding />
          </div>
        )}

        <div className="lg:hidden h-20" />
      </div>
    </TeamGuard>
  );
}
