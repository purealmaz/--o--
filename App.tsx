import React, { useState, useEffect } from 'react';
import { IngredientInput } from './components/IngredientInput';
import { RecipeDisplay } from './components/RecipeDisplay';
import { SavedRecipes } from './components/SavedRecipes';
import { Button } from './components/common/Button';
import { Spinner } from './components/common/Spinner';
import { generateRecipe } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { translations, Language } from './utils/translations';
import { LanguageIcon } from './components/common/Icons';
import { ThemeSwitcher, Theme } from './components/ThemeSwitcher';

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

  // Load saved recipes from local storage on mount
  useEffect(() => {
    try {
      const storedRecipes = localStorage.getItem('savedRecipes');
      if (storedRecipes) {
        setSavedRecipes(JSON.parse(storedRecipes));
      }
    } catch (e) {
      console.error("Failed to load recipes from local storage", e);
    }
  }, []);

  // Save recipes to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
    } catch (e) {
      console.error("Failed to save recipes to local storage", e);
    }
  }, [savedRecipes]);
  
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
  
  const handleViewRecipe = (recipe: string) => {
    setGeneratedRecipe(recipe);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleIngredientsIdentified = (newIngredients: string[]) => {
    const uniqueIngredients = new Set([...ingredients, ...newIngredients]);
    setIngredients(Array.from(uniqueIngredients));
  };

  const isButtonDisabled = ingredients.length === 0 || isLoading || isAnalyzing;
  
  const toggleLanguage = () => {
    setLanguage(prevLang => {
        if (prevLang === 'ru') return 'en';
        if (prevLang === 'en') return 'lt';
        return 'ru'; // from 'lt'
    });
  };
  
  const getNextLanguageLabel = () => {
    if (language === 'ru') return 'EN';
    if (language === 'en') return 'LT';
    return 'RU'; // from 'lt'
  };


  return (
    <div className="bg-background min-h-screen font-sans text-foreground transition-colors duration-300">
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl relative">
        
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <ThemeSwitcher theme={theme} setTheme={setTheme} />
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 bg-card p-2 rounded-full shadow-lg border border-foreground/10 text-foreground/80 hover:bg-foreground/10"
              aria-label="Switch language"
            >
              <LanguageIcon className="w-5 h-5" />
              <span className="font-semibold text-sm pr-1">{getNextLanguageLabel()}</span>
            </button>
        </div>
        
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-primary-800">{t.appTitle}</h1>
          <p className="mt-3 text-lg sm:text-xl text-foreground/80 max-w-2xl mx-auto">
            {t.appSubtitle}
          </p>
        </header>

        <div className="space-y-8">
          <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-foreground/10">
             <h2 className="text-2xl font-semibold text-card-foreground mb-4">{t.step1Title}</h2>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3">
                    <IngredientInput ingredients={ingredients} setIngredients={setIngredients} t={t} />
                </div>
                <div className="md:col-span-2 space-y-2">
                    <p className="text-center text-sm text-foreground/60 uppercase font-semibold pb-1">{t.or}</p>
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
            <div className="bg-card p-6 sm:p-8 rounded-2xl shadow-lg border border-foreground/10 animate-fade-in">
              <h2 className="text-2xl font-semibold text-card-foreground mb-4">{t.step2Title}</h2>
              <div className="flex flex-wrap gap-3">
                {(['classic', 'humorous', 'kid-friendly', 'in-a-hurry', 'crazy-chef', 'chef-special', 'from-the-web'] as RecipeStyle[]).map(style => (
                  <button 
                    key={style}
                    onClick={() => setRecipeStyle(style)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                      recipeStyle === style 
                      ? 'bg-primary-600 text-primary-foreground shadow' 
                      : 'bg-primary-100/50 text-primary-800 hover:bg-primary-100'
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
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg" role="alert">
              <p className="font-bold">{t.errorTitle}</p>
              <p>{error}</p>
            </div>
          )}
          
          {generatedRecipe && <RecipeDisplay recipe={generatedRecipe} onSave={handleSaveRecipe} t={t} language={language} />}

          <SavedRecipes recipes={savedRecipes} onView={handleViewRecipe} onDelete={handleDeleteRecipe} t={t} />
        </div>
      </main>
    </div>
  );
};

export default App;