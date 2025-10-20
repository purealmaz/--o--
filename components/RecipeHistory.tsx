import React from 'react';
import { TrashIcon, EyeIcon } from './common/Icons';
import { Translation } from '../utils/translations';

interface Recipe {
  id: number;
  title: string;
  recipe: string;
}

interface RecipeHistoryProps {
  history: Recipe[];
  onView: (recipe: string) => void;
  onDelete: (id: number) => void;
  t: Translation;
}

export const RecipeHistory: React.FC<RecipeHistoryProps> = ({ history, onView, onDelete, t }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-lg border border-border animate-fade-in space-y-4">
      <h2 className="text-2xl font-bold text-card-foreground">{t.recipeHistory}</h2>
      <ul className="divide-y divide-border">
        {history.map((r) => (
          <li key={r.id} className="py-3 flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors hover:bg-muted/50 rounded-md -mx-2 px-2">
            <span className="font-medium text-card-foreground flex-1 text-left">{r.title}</span>
            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => onView(r.recipe)}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                aria-label={`${t.showRecipe} ${r.title}`}
              >
                <EyeIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
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