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
      className="flex items-center justify-center bg-card p-2 rounded-full shadow-lg border border-foreground/10 text-foreground/80 hover:bg-foreground/10"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? 
        <MoonIcon className="w-5 h-5" /> : 
        <SunIcon className="w-5 h-5" />
      }
    </button>
  );
};
