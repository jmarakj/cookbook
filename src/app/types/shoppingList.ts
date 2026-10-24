export type ShoppingItem = {
  id: string;
  ingredientId: string | null;
  name: string;
  amount: number | null;
  unit: string | null;
  recipeId: string | null;
  bought: boolean;
};

export type ShoppingItemNew = Omit<ShoppingItem, 'id' | 'bought'>;

export type ShoppingItemPatch = Partial<Omit<ShoppingItem, 'id'>>;
