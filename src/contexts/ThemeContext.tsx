import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Theme } from '../types';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme: Theme = {
  bg: 'bg-gray-50',
  card: 'bg-white',
  text: 'text-gray-900',
  textSecondary: 'text-gray-600',
  border: 'border-gray-200',
  input: 'bg-white text-gray-900 border-gray-300',
  hover: 'hover:bg-gray-100',
};

const darkTheme: Theme = {
  bg: 'bg-gray-900',
  card: 'bg-gray-800',
  text: 'text-gray-100',
  textSecondary: 'text-gray-400',
  border: 'border-gray-700',
  input: 'bg-gray-700 text-gray-100 border-gray-600',
  hover: 'hover:bg-gray-700',
};

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('gym-darkmode');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev: boolean) => {
      const newValue = !prev;
      localStorage.setItem('gym-darkmode', JSON.stringify(newValue));
      return newValue;
    });
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
