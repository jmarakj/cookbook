export type Ingredient = {
  id: string
  amount: number | null
  unit: string | null
  notes: string | null
}

export type Recipe = {
  id: string
  name: string
  // path relative to public/, e.g. "images/langose.jpg"
  image: string | null
  category: string[]
  // ISO 3166 country code – not displayed, only used for search
  cuisine: string
  yield: number | null
  times: { prep: number; cook: number; rest: number; total: number }
  ingredients: Ingredient[]
  steps: string[]
  notes: string | null
}

// entry of public/recipes.json, see scripts/build-recipes-index.mjs
export type RecipeSummary = {
  id: string
  name: string
  image: string | null
  category: string[]
  search: string
}
