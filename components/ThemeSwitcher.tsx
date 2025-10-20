import React from 'react';
import { SunIcon, MoonIcon } from './common/Icons';

export type Theme = 'light' | 'dark';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center bg-card p-2 rounded-md shadow-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? 
        <MoonIcon className="w-5 h-5" /> : 
        <SunIcon className="w-5 h-5" />
      }
    </button>
  );
};