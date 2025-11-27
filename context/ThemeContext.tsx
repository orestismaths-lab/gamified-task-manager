'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('task-manager-theme');
      if (savedTheme === 'dark') {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (typeof window !== 'undefined') {
      if (newIsDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('task-manager-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('task-manager-theme', 'light');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
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

