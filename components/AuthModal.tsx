import React, { useState, FormEvent } from 'react';
import { Translation } from '../utils/translations';
import { XIcon, GoogleIcon, FacebookIcon } from './common/Icons';
import { Spinner } from './common/Spinner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView: 'login' | 'signup';
  setCurrentUser: (email: string) => void;
  t: Translation;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView, setCurrentUser, t }) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError(t.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setError(t.passwordTooShort);
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
        try {
            if (view === 'signup') {
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                if (users[email]) {
                    throw new Error(t.emailExists);
                }
                // In a real app, you'd hash the password. Here we just store the email.
                users[email] = { password: 'mock_password' };
                localStorage.setItem('users', JSON.stringify(users));
                localStorage.setItem('currentUser', email);
                setCurrentUser(email);
                onClose();
            } else { // login
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                if (!users[email]) {
                     throw new Error(t.userNotFound);
                }
                // We're not checking password for this simulation
                localStorage.setItem('currentUser', email);
                setCurrentUser(email);
                onClose();
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError(t.unknownError);
            }
        } finally {
             setIsLoading(false);
        }
    }, 500);
  };

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setIsLoading(true);
    setError('');

    // Simulate social login flow
    setTimeout(() => {
        const promptTitle = t.socialLoginPromptTitle;
        const promptBody = t.socialLoginPromptBody;
        const socialEmail = prompt(`${promptTitle}\n\n${promptBody}`, `user@${provider}.com`);

        if (socialEmail) {
            if (!validateEmail(socialEmail)) {
                setError(t.invalidEmail);
                setIsLoading(false);
                return;
            }

            try {
                // For social logins, create the user if they don't exist.
                const users = JSON.parse(localStorage.getItem('users') || '{}');
                if (!users[socialEmail]) {
                    users[socialEmail] = { password: 'social_login_mock' };
                    localStorage.setItem('users', JSON.stringify(users));
                }

                localStorage.setItem('currentUser', socialEmail);
                setCurrentUser(socialEmail);
                onClose();
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(t.unknownError);
                }
            }
        }
        
        setIsLoading(false);
    }, 300);
  };


  if (!isOpen) return null;

  const title = view === 'login' ? t.loginTitle : t.signupTitle;
  const buttonText = view === 'login' ? t.login : t.signup;
  const switchText = view === 'login' ? t.switchToSignup : t.switchToLogin;

  const switchView = () => {
    setView(view === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="relative bg-card w-full max-w-sm p-8 rounded-lg shadow-2xl m-4 border border-border"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <XIcon className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center text-card-foreground mb-6">{title}</h2>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="email">{t.email}</label>
            <input 
              type="email" 
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow placeholder:text-muted-foreground"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1" htmlFor="password">{t.password}</label>
            <input 
              type="password" 
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow placeholder:text-muted-foreground"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="pt-2">
            <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors disabled:bg-muted disabled:text-muted-foreground"
            >
              {isLoading && <Spinner />}
              {buttonText}
            </button>
          </div>
        </form>

        <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t.orContinueWith}</span>
            </div>
        </div>
        
        <div className="space-y-3">
            <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-border rounded-md font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GoogleIcon className="w-5 h-5" />
                {view === 'login' ? t.loginWithGoogle : t.signupWithGoogle}
            </button>
            <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-2 border border-border rounded-md font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <FacebookIcon className="w-5 h-5" />
                {view === 'login' ? t.loginWithFacebook : t.signupWithFacebook}
            </button>
        </div>


        <div className="text-center mt-6">
            <button onClick={switchView} className="text-sm text-primary hover:underline">
                {switchText}
            </button>
        </div>
      </div>
    </div>
  );
};