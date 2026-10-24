import { useEffect, useState } from 'react'
import { shoppingList } from '../api'
import type { ShoppingItemNew, ShoppingItem } from '../types'

type Result = { items: ShoppingItem[] | null; error: string | null }

function useShoppingList() {
  const [result, setResult] = useState<Result>({ items: null, error: null })
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let ignore = false
    shoppingList
      .getItems()
      .then((items) => !ignore && setResult({ items, error: null }))
      .catch((err: Error) => !ignore && setResult({ items: null, error: err.message }))
    return () => {
      ignore = true
    }
  }, [version])

  const change = (operation: Promise<unknown>) =>
    operation
      .catch((err: Error) => setResult((r) => ({ ...r, error: err.message })))
      .finally(() => setVersion((v) => v + 1))

  return {
    ...result,
    add: (items: ShoppingItemNew[]) => change(shoppingList.addItems(items)),
    setBought: (ids: string[], bought: boolean) =>
      change(shoppingList.updateItems(ids, { bought })),
    remove: (ids: string[]) => change(shoppingList.deleteItems(ids)),
    removeRecipe: (recipeId: string) => change(shoppingList.deleteRecipeItems(recipeId)),
  }
}

export default useShoppingList
