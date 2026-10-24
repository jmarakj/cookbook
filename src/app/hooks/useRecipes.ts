import { useEffect, useState } from 'react';
import { recipesService } from '../api';
import type { RecipeSummary } from '../types';

// random sort key per recipe, kept for the page load so the order survives
// filtering, infinite scroll and coming back from a detail
const randomRank = new Map<string, number>();

function rankOf(id: string) {
  let rank = randomRank.get(id);
  if (rank === undefined) {
    rank = Math.random();
    randomRank.set(id, rank);
  }
  return rank;
}

function shuffle(recipes: RecipeSummary[]) {
  return [...recipes].sort((a, b) => rankOf(a.id) - rankOf(b.id));
}

type Result = { recipes: RecipeSummary[] | null; error: string | null };

// Loads the recipe index in a random order that stays the same for the whole
// page load; recipes and error are both null while loading.
function useRecipes() {
  const [result, setResult] = useState<Result>({ recipes: null, error: null });

  useEffect(() => {
    let ignore = false;
    recipesService
      .getRecipes()
      .then((recipes) => !ignore && setResult({ recipes: shuffle(recipes), error: null }))
      .catch((err: Error) => !ignore && setResult({ recipes: null, error: err.message }));
    return () => {
      ignore = true;
    };
  }, []);

  return result;
}

export default useRecipes;
