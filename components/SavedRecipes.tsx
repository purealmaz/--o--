import React from 'react';
import { TrashIcon, EyeIcon } from './common/Icons';
import { Translation } from '../utils/translations';

interface Recipe {
  id: number;
  title: string;
  recipe: string;
}

interface SavedRecipesProps {
  recipes: Recipe[];
  onView: (recipe: string) => void;
  onDelete: (id: number) => void;
  t: Translation;
}

export const SavedRecipes: React.FC<SavedRecipesProps> = ({ recipes, onView, onDelete, t }) => {
  if (recipes.length === 0) {
    return null;
  }

  return (
    <div className="bg-card p-6 rounded-2xl shadow-lg border border-foreground/10 animate-fade-in space-y-4">
      <h2 className="text-2xl font-semibold text-card-foreground">{t.savedRecipes}</h2>
      <ul className="divide-y divide-foreground/10">
        {recipes.map((r) => (
          <li key={r.id} className="py-4 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="font-medium text-card-foreground flex-1 text-left">{r.title}</span>
            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onView(r.recipe)}
                className="p-2 text-foreground/60 hover:text-primary-600 hover:bg-primary-100 rounded-full transition-colors"
                aria-label={`${t.showRecipe} ${r.title}`}
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="p-2 text-foreground/60 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                aria-label={`${t.deleteRecipe} ${r.title}`}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};