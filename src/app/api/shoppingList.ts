import type { ShoppingItemNew, ShoppingItem, ShoppingItemPatch } from '../types'

export interface ShoppingListService {
  getItems(): Promise<ShoppingItem[]>
  addItems(items: ShoppingItemNew[]): Promise<ShoppingItem[]>
  updateItems(ids: string[], patch: ShoppingItemPatch): Promise<void>
  deleteItems(ids: string[]): Promise<void>
  deleteRecipeItems(recipeId: string): Promise<void>
}

const STORAGE_KEY = 'shopping-list'
const CREATED_KEY = 'shopping-list-created'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function read(): ShoppingItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function write(items: ShoppingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  if (items.length === 0) localStorage.removeItem(CREATED_KEY)
  else if (!localStorage.getItem(CREATED_KEY)) localStorage.setItem(CREATED_KEY, String(Date.now()))
}

function clearIfStale() {
  const created = Number(localStorage.getItem(CREATED_KEY))
  if (created && Date.now() - created > MAX_AGE_MS) write([])
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const localShoppingList: ShoppingListService = {
  async getItems() {
    clearIfStale()
    return read()
  },

  async addItems(items) {
    clearIfStale()
    const created = items.map((item) => ({ ...item, id: newId(), bought: false }))
    write([...read(), ...created])
    return created
  },

  async updateItems(ids, patch) {
    write(read().map((item) => (ids.includes(item.id) ? { ...item, ...patch } : item)))
  },

  async deleteItems(ids) {
    write(read().filter((item) => !ids.includes(item.id)))
  },

  async deleteRecipeItems(recipeId) {
    write(read().filter((item) => item.recipeId !== recipeId))
  },
}

export const shoppingList: ShoppingListService = localShoppingList
