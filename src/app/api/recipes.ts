import type { Recipe, RecipeSummary } from '../types';

export type LastSeenRecipe = Pick<Recipe, 'id' | 'name' | 'image'>;

export interface RecipeService {
  getRecipe(id: string): Promise<Recipe>;
  getRecipes(): Promise<RecipeSummary[]>;
  getLastSeen(): LastSeenRecipe | null;
  setLastSeen(recipe: LastSeenRecipe): void;
}

const base = import.meta.env.BASE_URL;
const LAST_SEEN_KEY = 'last-seen-recipe';

export const recipesService: RecipeService = {
  async getRecipe(id) {
    const res = await fetch(`${base}recipes/${encodeURIComponent(id)}.json`);
    if (!res.ok) {
      throw new Error(`Recept „${id}“ sa nenašiel`);
    }
    return res.json();
  },

  async getRecipes() {
    const res = await fetch(`${base}recipes.json`);
    if (!res.ok) {
      throw new Error('Nepodarilo sa načítať recepty');
    }
    return res.json();
  },

  getLastSeen() {
    try {
      return JSON.parse(localStorage.getItem(LAST_SEEN_KEY) ?? 'null');
    } catch {
      return null;
    }
  },

  setLastSeen({ id, name, image }) {
    try {
      localStorage.setItem(LAST_SEEN_KEY, JSON.stringify({ id, name, image }));
    } catch {
      // storage unavailable – the home page just won't show it
    }
  },
};
