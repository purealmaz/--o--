import React, { useState, useEffect } from 'react';
import { IngredientInput } from './components/IngredientInput';
import { RecipeDisplay } from './components/RecipeDisplay';
import { SavedRecipes } from './components/SavedRecipes';
import { Button } from './components/common/Button';
import { Spinner } from './components/common/Spinner';
import { generateRecipe } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { translations, Language } from './utils/translations';
import { Theme } from './components/ThemeSwitcher';
import { RecipeHistory } from './components/RecipeHistory';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';

type RecipeStyle = 'classic' | 'humorous' | 'kid-friendly' | 'in-a-hurry' | 'crazy-chef' | 'chef-special' | 'from-the-web';

interface SavedRecipe {
  id: number;
  title: string;
  recipe: string;
}

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipeStyle, setRecipeStyle] = useState<RecipeStyle>('classic');
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [recipeHistory, setRecipeHistory] = useState<SavedRecipe[]>([]);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'signup'>('login');


  const [language, setLanguage] = useState<Language>(() => {
    const storedLang = localStorage.getItem('language');
    if (storedLang === 'ru' || storedLang === 'en' || storedLang === 'lt') {
      return storedLang as Language;
    }
    return 'ru';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || storedTheme === 'light') {
      return storedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const t = translations[language];

  // Check for logged-in user on mount
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  // Load recipes and history from local storage when user changes
  useEffect(() => {
    if (!currentUser) {
      setSavedRecipes([]);
      setRecipeHistory([]);
      return;
    };
    try {
      const storedRecipes = localStorage.getItem(`savedRecipes_${currentUser}`);
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes));
      } else {
        setSavedRecipes([]);
      }
      const storedHistory = localStorage.getItem(`recipeHistory_${currentUser}`);
      if (storedHistory) {
        setRecipeHistory(JSON.parse(storedHistory));
      } else {
        setRecipeHistory([]);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
  }, [currentUser]);

  // Save recipes to local storage whenever they change
  useEffect(() => {
    if (!currentUser) return;
    try {
      localStorage.setItem(`savedRecipes_${currentUser}`, JSON.stringify(savedRecipes));
    } catch (e) {
      console.error("Failed to save recipes to local storage", e);
    }
  }, [savedRecipes, currentUser]);
  
  // Save history to local storage whenever it changes
  useEffect(() => {
    if (!currentUser) return;
    try {
        localStorage.setItem(`recipeHistory_${currentUser}`, JSON.stringify(recipeHistory));
    } catch (e) {
        console.error("Failed to save history to local storage", e);
    }
  }, [recipeHistory, currentUser]);

  // Save language to local storage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Apply theme and save to local storage
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);


  const handleGenerateRecipe = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedRecipe(null);
    try {
      const recipe = await generateRecipe(ingredients, recipeStyle, language);
      setGeneratedRecipe(recipe);

      if(currentUser) {
        const title = extractTitle(recipe);
        const newHistoryItem: SavedRecipe = {
          id: Date.now(),
          title,
          recipe,
        };
        // Add to history, prevent duplicates based on content, and limit to 5
        setRecipeHistory(prev => {
          const withoutDuplicates = prev.filter(item => item.recipe !== recipe);
          return [newHistoryItem, ...withoutDuplicates].slice(0, 5);
        });
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
  };
  
  const extractTitle = (recipeText: string): string => {
    const lines = recipeText.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('# ')) {
        return trimmedLine.substring(2).replace(/[*_]/g, '');
      }
      if(trimmedLine) return trimmedLine.replace(/[*_]/g, ''); // Fallback to first non-empty line
    }
    return t.untitledRecipe;
  };

  const handleSaveRecipe = () => {
    if (generatedRecipe) {
      if (!currentUser) {
        alert(t.loginToSave);
        openAuthModal('login');
        return;
      }
      const title = extractTitle(generatedRecipe);
      if (savedRecipes.some(r => r.recipe === generatedRecipe)) {
        alert(t.recipeAlreadySaved);
        return;
      }
      const newRecipe: SavedRecipe = {
        id: Date.now(),
        title,
        recipe: generatedRecipe,
      };
      setSavedRecipes(prev => [newRecipe, ...prev]);
      setGeneratedRecipe(null);
    }
  };

  const handleDeleteRecipe = (id: number) => {
    setSavedRecipes(prev => prev.filter(r => r.id !== id));
  };
  
  const handleDeleteFromHistory = (id: number) => {
    setRecipeHistory(prev => prev.filter(r => r.id !== id));
  };

  const handleViewRecipe = (recipe: string) => {
    setGeneratedRecipe(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleIngredientsIdentified = (newIngredients: string[]) => {
    const uniqueIngredients = new Set([...ingredients, ...newIngredients]);
    setIngredients(Array.from(uniqueIngredients));
  };
  
  const openAuthModal = (view: 'login' | 'signup') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const isButtonDisabled = ingredients.length === 0 || isLoading || isAnalyzing;
  
  const toggleLanguage = () => {
    setLanguage(prevLang => {
        if (prevLang === 'ru') return 'en';
        if (prevLang === 'en') return 'lt';
        return 'ru'; // from 'lt'
    });
  };

  return (
    <div className="bg-background min-h-screen font-sans text-foreground transition-colors duration-300">
      
      {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            initialView={authModalView}
            setCurrentUser={setCurrentUser}
            t={t}
          />
      )}

      <Header 
        theme={theme}
        setTheme={setTheme}
        language={language}
        toggleLanguage={toggleLanguage}
        currentUser={currentUser}
        onLoginClick={() => openAuthModal('login')}
        onSignupClick={() => openAuthModal('signup')}
        onLogoutClick={handleLogout}
        t={t}
      />
      
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary">{t.appTitle}</h1>
          <p className="mt-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.appSubtitle}
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border">
             <h2 className="text-2xl font-bold text-card-foreground mb-4">{t.step1Title}</h2>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3">
                    <IngredientInput ingredients={ingredients} setIngredients={setIngredients} t={t} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <p className="text-center text-xs text-muted-foreground uppercase font-semibold pb-1">{t.or}</p>
                    <ImageUploader 
                        onIngredientsIdentified={handleIngredientsIdentified}
                        isAnalyzing={isAnalyzing}
                        setIsAnalyzing={setIsAnalyzing}
                        setError={setError}
                        t={t}
                        language={language}
                     />
                </div>
             </div>
          </div>

          {ingredients.length > 0 && (
            <div className="bg-card p-6 sm:p-8 rounded-lg shadow-lg border border-border animate-fade-in">
              <h2 className="text-2xl font-bold text-card-foreground mb-4">{t.step2Title}</h2>
              <div className="flex flex-wrap gap-2">
                {(['classic', 'humorous', 'kid-friendly', 'in-a-hurry', 'crazy-chef', 'chef-special', 'from-the-web'] as RecipeStyle[]).map(style => (
                  <button 
                    key={style}
                    onClick={() => setRecipeStyle(style)}
                    className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 text-sm ${
                      recipeStyle === style 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'bg-muted text-muted-foreground hover:bg-border hover:text-foreground'
                    }`}
                  >
                    {t[style]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center pt-4">
            <Button onClick={handleGenerateRecipe} disabled={isButtonDisabled}>
              {isLoading && <Spinner />}
              {isLoading ? t.generating : t.generateRecipe}
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg" role="alert">
              <p className="font-bold">{t.errorTitle}</p>
              <p>{error}</p>
            </div>
          )}
          
          {generatedRecipe && <RecipeDisplay recipe={generatedRecipe} onSave={handleSaveRecipe} t={t} language={language} />}

          {currentUser && (
            <>
              <RecipeHistory history={recipeHistory} onView={handleViewRecipe} onDelete={handleDeleteFromHistory} t={t} />
              <SavedRecipes recipes={savedRecipes} onView={handleViewRecipe} onDelete={handleDeleteRecipe} t={t} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;