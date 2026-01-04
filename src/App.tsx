import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { SettingsModal } from './components/SettingsModal';
import { RoutinesTab } from './components/RoutinesTab';
import { WorkoutTab } from './components/WorkoutTab';
import { ProgressTab } from './components/ProgressTab';
import type { TabType } from './types';

interface GymTrackerAppProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
}

function GymTrackerApp({ activeTab, setActiveTab, showSettings, setShowSettings }: GymTrackerAppProps) {
  const { theme } = useTheme();
  const { user, authLoading } = useAuth();
  const { dataLoading } = useData();

  if (authLoading) {
    return (
      <div className={`min-h-screen ${theme.bg} flex items-center justify-center`}>
        <div className='text-center'>
          <div className='w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4' />
          <p className={theme.textSecondary}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        dataLoading={dataLoading}
      >
        {activeTab === 'routines' && <RoutinesTab />}
        {activeTab === 'workout' && <WorkoutTab setActiveTab={setActiveTab} />}
        {activeTab === 'progress' && <ProgressTab setActiveTab={setActiveTab} />}
      </Layout>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

function GymTrackerWithProviders() {
  const [activeTab, setActiveTab] = useState<TabType>('routines');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<string | null>(null);

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <DataProvider
            setActiveTab={setActiveTab}
            setShowSettings={setShowSettings}
            setSelectedWorkoutDetail={setSelectedWorkoutDetail}
          >
            <GymTrackerApp
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              showSettings={showSettings}
              setShowSettings={setShowSettings}
            />
          </DataProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return <GymTrackerWithProviders />;
}
