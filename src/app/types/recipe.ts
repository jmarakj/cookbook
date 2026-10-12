export type Ingredient = {
  id: string
  amount: number | null
  unit: string | null
  notes: string | null
}

export type Recipe = {
  id: string
  name: string
  category: string[]
  // ISO 3166 country code – not displayed, only used for search
  cuisine: string
  yield: number | null
  times: { prep: number; cook: number; rest: number; total: number }
  ingredients: Ingredient[]
  steps: string[]
  notes: string | null
}

export type EnumItem = { id: string; label: string }

export type Enums = Record<'categories' | 'units' | 'ingredients', EnumItem[]>

// entry of public/recipes.json, see scripts/build-recipes-index.mjs
export type RecipeSummary = {
  id: string
  name: string
  category: string[]
  search: string
}
