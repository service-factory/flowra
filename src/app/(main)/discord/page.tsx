"use client";

import { DiscordHeader } from './components/DiscordHeader';
import { DiscordStatusCards } from './components/DiscordStatusCards';
import { DiscordDetails } from './components/DiscordDetails';
import { DiscordActions } from './components/DiscordActions';
import { DiscordConnectionForm } from './components/DiscordConnectionForm';
import { DiscordUserSettings } from './components/DiscordUserSettings';
import { DiscordBotTest } from './components/DiscordBotTest';
import { DiscordAlerts } from './components/DiscordAlerts';
import { useDiscordData } from './hooks/useDiscordData';
import { DiscordPageSkeleton } from './components/DiscordLoadingSkeleton';

export default function DiscordPage() {
  const {
    discordStatus,
    isLoading,
    isChecking,
    error,
    success,
    userSettings,
    isBotTestLoading,
    botTestResult,
    botTestForm,
    connectionForm,
    isConnected,
    isDisconnected,
    setUserSettings,
    setBotTestForm,
    setConnectionForm,
    checkDiscordStatus,
    handleConnect,
    handleDisconnect,
    handleSaveUserSettings,
    handleBotTestNotification,
  } = useDiscordData();

  if (isLoading) {
    return <DiscordPageSkeleton />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DiscordHeader 
          discordStatus={discordStatus}
          isChecking={isChecking}
          isLoading={isLoading}
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <DiscordStatusCards 
              discordStatus={discordStatus}
              isLoading={isLoading}
            />

            {discordStatus && (
              <DiscordDetails 
                discordStatus={discordStatus}
                isLoading={isLoading}
              />
            )}

            {discordStatus && (
              <DiscordActions
                discordStatus={discordStatus}
                isChecking={isChecking}
                isLoading={isLoading}
                onRefresh={checkDiscordStatus}
                onDisconnect={handleDisconnect}
                loading={isLoading}
              />
            )}

            {isDisconnected && (
              <DiscordConnectionForm
                connectionForm={connectionForm}
                isLoading={isLoading}
                onFormChange={setConnectionForm}
                onConnect={handleConnect}
                loading={isLoading}
              />
            )}

            {isConnected && userSettings && (
              <DiscordUserSettings
                userSettings={userSettings}
                isLoading={isLoading}
                onSettingsChange={setUserSettings}
                onSave={handleSaveUserSettings}
                loading={isLoading}
              />
            )}

            {process.env.NODE_ENV === 'development' && isConnected && (
              <DiscordBotTest
                botTestForm={botTestForm}
                botTestResult={botTestResult}
                isBotTestLoading={isBotTestLoading}
                onFormChange={setBotTestForm}
                onTest={handleBotTestNotification}
                loading={isLoading}
              />
            )}

            <DiscordAlerts
              error={error}
              success={success}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
