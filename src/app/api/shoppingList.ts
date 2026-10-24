import type { ShoppingItemNew, ShoppingItem, ShoppingItemPatch } from '../types';
import { uniqueId } from '../utils';

export interface ShoppingListService {
  getItems(): Promise<ShoppingItem[]>;
  addItems(items: ShoppingItemNew[]): Promise<ShoppingItem[]>;
  updateItems(ids: string[], patch: ShoppingItemPatch): Promise<ShoppingItem[]>;
  deleteItems(ids: string[]): Promise<ShoppingItem[]>;
  deleteRecipeItems(recipeId: string): Promise<ShoppingItem[]>;
}

const STORAGE_KEY = 'shopping-list';
const EDITED_KEY = 'shopping-list-edited';
const MAX_AGE_MS = 3 * 24 * 60 * 60 * 1000;

function read(): ShoppingItem[] {
  const edited = Number(localStorage.getItem(EDITED_KEY));
  if (edited && Date.now() - edited > MAX_AGE_MS) {
    return write([]);
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function write(items: ShoppingItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  if (items.length === 0) {
    localStorage.removeItem(EDITED_KEY);
  } else {
    localStorage.setItem(EDITED_KEY, String(Date.now()));
  }

  return items;
}

export const shoppingListService: ShoppingListService = {
  async getItems() {
    return read();
  },

  async addItems(items) {
    const created = items.map((item) => ({ ...item, id: uniqueId(), bought: false }));
    return write([...read(), ...created]);
  },

  async updateItems(ids, patch) {
    return write(read().map((item) => (ids.includes(item.id) ? { ...item, ...patch } : item)));
  },

  async deleteItems(ids) {
    return write(read().filter((item) => !ids.includes(item.id)));
  },

  async deleteRecipeItems(recipeId) {
    return write(read().filter((item) => item.recipeId !== recipeId));
  },
};
