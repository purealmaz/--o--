import React from 'react';
import { ThemeSwitcher, Theme } from './ThemeSwitcher';
import { LanguageIcon, UserIcon, LogoutIcon } from './common/Icons';
import { Language, Translation } from '../utils/translations';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    language: Language;
    toggleLanguage: () => void;
    currentUser: string | null;
    onLoginClick: () => void;
    onSignupClick: () => void;
    onLogoutClick: () => void;
    t: Translation;
}

export const Header: React.FC<HeaderProps> = ({
    theme,
    setTheme,
    language,
    toggleLanguage,
    currentUser,
    onLoginClick,
    onSignupClick,
    onLogoutClick,
    t
}) => {

    const getNextLanguageLabel = () => {
        if (language === 'ru') return 'EN';
        if (language === 'en') return 'LT';
        return 'RU'; // from 'lt'
    };

    const authButtonClasses = "px-4 py-2 rounded-md font-semibold transition-colors text-sm";
    const primaryAuthButton = `${authButtonClasses} bg-primary text-primary-foreground hover:bg-primary/90`;
    const secondaryAuthButton = `${authButtonClasses} bg-muted text-muted-foreground hover:bg-border hover:text-foreground`;

    return (
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                <div className="font-extrabold text-lg text-foreground">
                    {t.appTitle.split('-')[0]}
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3">
                    <ThemeSwitcher theme={theme} setTheme={setTheme} />
                    <button
                        onClick={toggleLanguage}
                        className="flex items-center gap-2 bg-card p-2 rounded-md shadow-sm border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Switch language"
                    >
                        <LanguageIcon className="w-5 h-5" />
                        <span className="font-semibold text-sm pr-1 hidden sm:inline">{getNextLanguageLabel()}</span>
                    </button>
                    
                    <div className="w-px h-6 bg-border mx-1"></div>

                    {currentUser ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <UserIcon className="w-6 h-6" />
                             <span className="font-semibold text-sm hidden sm:inline">{t.welcome}, {currentUser.split('@')[0]}</span>
                           </div>
                            <button onClick={onLogoutClick} className={`${secondaryAuthButton} flex items-center gap-2`}>
                                <LogoutIcon className="w-5 h-5 sm:-ml-1"/>
                                <span className="hidden sm:inline">{t.logout}</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button onClick={onLoginClick} className={secondaryAuthButton}>{t.login}</button>
                            <button onClick={onSignupClick} className={primaryAuthButton}>{t.signup}</button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};