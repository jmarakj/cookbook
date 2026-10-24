import type { Recipe } from '../types'

export type LastSeenRecipe = Pick<Recipe, 'id' | 'name' | 'image'>

const STORAGE_KEY = 'last-seen-recipe'

export function getLastSeenRecipe(): LastSeenRecipe | null {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
  } catch {
    return null
  }
}

export function setLastSeenRecipe({ id, name, image }: LastSeenRecipe) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, name, image }))
  } catch {
    // storage unavailable – the home page just won't show it
  }
}
