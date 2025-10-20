import React, { useState, KeyboardEvent } from 'react';
import { XIcon } from './common/Icons';
import { Translation } from '../utils/translations';

interface IngredientInputProps {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  t: Translation;
}

export const IngredientInput: React.FC<IngredientInputProps> = ({ ingredients, setIngredients, t }) => {
  const [currentIngredient, setCurrentIngredient] = useState('');

  const handleAddIngredient = () => {
    const trimmedIngredient = currentIngredient.trim();
    if (trimmedIngredient && !ingredients.some(ing => ing.toLowerCase() === trimmedIngredient.toLowerCase())) {
      setIngredients([...ingredients, trimmedIngredient]);
      setCurrentIngredient('');
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };
  
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddIngredient();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={currentIngredient}
          onChange={(e) => setCurrentIngredient(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.ingredientsPlaceholder}
          className="flex-grow w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-shadow placeholder:text-muted-foreground"
        />
        <button
          onClick={handleAddIngredient}
          className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors disabled:bg-muted disabled:text-muted-foreground"
          disabled={!currentIngredient.trim()}
        >
          {t.add}
        </button>
      </div>
      
      {ingredients.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-muted text-foreground text-sm font-medium pl-3 pr-2 py-1 rounded-full"
            >
              <span>{ingredient}</span>
              <button
                onClick={() => handleRemoveIngredient(index)}
                className="text-muted-foreground hover:text-foreground/80 focus:outline-none"
                aria-label={`${t.remove} ${ingredient}`}
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};