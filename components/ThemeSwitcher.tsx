import React from 'react';
import { PaletteIcon } from './common/Icons';

export type Theme = 'amber' | 'teal' | 'rose' | 'indigo';

interface ThemeSwitcherProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const themes: { name: Theme; color: string }[] = [
  { name: 'amber', color: 'bg-amber-500' },
  { name: 'teal', color: 'bg-teal-500' },
  { name: 'rose', color: 'bg-rose-500' },
  { name: 'indigo', color: 'bg-indigo-500' },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex items-center gap-2 bg-card p-2 rounded-full shadow-lg border border-foreground/10">
        <PaletteIcon className="w-5 h-5 text-foreground/70 ml-1" />
        {themes.map((t) => (
          <button
            key={t.name}
            onClick={() => setTheme(t.name)}
            className={`w-6 h-6 rounded-full ${t.color} transition-transform hover:scale-110 focus:outline-none ${
              theme === t.name ? 'ring-2 ring-offset-2 ring-offset-card ring-primary' : ''
            }`}
            aria-label={`Switch to ${t.name} theme`}
          />
        ))}
      </div>
    </div>
  );
};
