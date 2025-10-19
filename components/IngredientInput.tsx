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
          className="flex-grow w-full px-4 py-2 bg-background border border-foreground/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-shadow placeholder:text-foreground/50"
        />
        <button
          onClick={handleAddIngredient}
          className="px-6 py-2 bg-primary-600 text-primary-foreground font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-foreground/20 disabled:text-foreground/50"
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
              className="flex items-center gap-2 bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              <span>{ingredient}</span>
              <button
                onClick={() => handleRemoveIngredient(index)}
                className="text-primary-600 hover:text-primary-800 focus:outline-none"
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