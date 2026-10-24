import { useSyncExternalStore } from 'react';
import { shoppingListService } from '../api';
import type { ShoppingItemNew, ShoppingItem } from '../types';

type Result = { items: ShoppingItem[] | null; error: string | null };

let state: Result = { items: null, error: null };
const listeners = new Set<() => void>();

function setState(next: Result) {
  state = next;
  listeners.forEach((listener) => listener());
}

function load() {
  return shoppingListService
    .getItems()
    .then((items) => setState({ items, error: null }))
    .catch((err: Error) => setState({ items: null, error: err.message }));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (state.items === null) {
    load();
  }
  return () => listeners.delete(listener);
}

const change = (operation: Promise<ShoppingItem[]>) =>
  operation
    .then((items) => setState({ items, error: null }))
    .catch((err: Error) => setState({ ...state, error: err.message }));

const actions = {
  add: (items: ShoppingItemNew[]) => change(shoppingListService.addItems(items)),
  setBought: (ids: string[], bought: boolean) => change(shoppingListService.updateItems(ids, { bought })),
  remove: (ids: string[]) => change(shoppingListService.deleteItems(ids)),
  removeRecipe: (recipeId: string) => change(shoppingListService.deleteRecipeItems(recipeId)),
};

function useShoppingList() {
  const result = useSyncExternalStore(subscribe, () => state);
  return { ...result, ...actions };
}

export default useShoppingList;
