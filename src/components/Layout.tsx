import React, { ReactNode } from 'react';
import { Dumbbell, Sun, Moon, Settings, LogOut, Calendar, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import type { TabType } from '../types';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  dataLoading: boolean;
}

export function Layout({
  children,
  activeTab,
  setActiveTab,
  showSettings,
  setShowSettings,
  dataLoading,
}: LayoutProps) {
  const { darkMode, toggleDarkMode, theme } = useTheme();
  const { handleLogout } = useAuth();

  const tabs = [
    { id: 'routines' as TabType, label: 'Rutinas', icon: Dumbbell },
    { id: 'workout' as TabType, label: 'Entrenar', icon: Calendar },
    { id: 'progress' as TabType, label: 'Progreso', icon: TrendingUp },
  ];

  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-200`}
    >
      <div className='max-w-6xl mx-auto p-3 sm:p-4'>
        {/* Header */}
        <div className='flex items-center justify-between mb-4 sm:mb-8'>
          <div className='flex items-center gap-2 sm:gap-3'>
            <Dumbbell className='w-6 h-6 sm:w-8 sm:h-8' />
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>
              Gym Tracker
            </h1>
          </div>
          <div className='flex gap-1 sm:gap-2'>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg ${theme.card} ${theme.hover} touch-manipulation`}
              aria-label='Toggle dark mode'
            >
              {darkMode ? (
                <Sun className='w-5 h-5' />
              ) : (
                <Moon className='w-5 h-5' />
              )}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${theme.card} ${theme.hover} touch-manipulation`}
              aria-label='Settings'
            >
              <Settings className='w-5 h-5' />
            </button>
            <button
              onClick={handleLogout}
              className={`p-2 rounded-lg ${theme.card} ${theme.hover} touch-manipulation text-red-500`}
              aria-label='Logout'
            >
              <LogOut className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex gap-1 sm:gap-2 mb-4 sm:mb-6 p-1 rounded-lg ${theme.card}`}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg transition-colors touch-manipulation text-xs sm:text-sm ${
                activeTab === id
                  ? 'bg-blue-600 text-white'
                  : `${theme.hover} ${theme.textSecondary}`
              }`}
            >
              <Icon className='w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0' />
              <span className='hidden xs:inline sm:inline'>{label}</span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {dataLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Content */}
        {!dataLoading && children}
      </div>
    </div>
  );
}
