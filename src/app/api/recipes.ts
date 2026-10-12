import type { Recipe, RecipeSummary } from '../types'

const base = import.meta.env.BASE_URL

export async function fetchRecipe(id: string): Promise<Recipe> {
  const res = await fetch(`${base}recipes/${encodeURIComponent(id)}.json`)
  if (!res.ok) throw new Error(`Recept „${id}“ sa nenašiel`)
  return res.json()
}

export async function fetchRecipes(): Promise<RecipeSummary[]> {
  const res = await fetch(`${base}recipes.json`)
  if (!res.ok) throw new Error('Nepodarilo sa načítať recepty')
  return res.json()
}

const IMAGE_EXTENSIONS = ['png', 'jpg', 'webp']

// candidates in order of preference – the image component tries them one by one
export function recipeImageUrls(id: string) {
  return IMAGE_EXTENSIONS.map(
    (ext) => `${base}images/${encodeURIComponent(id)}.${ext}`,
  )
}
