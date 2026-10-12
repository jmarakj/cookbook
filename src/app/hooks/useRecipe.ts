import { useEffect, useState } from 'react'
import { fetchRecipe } from '../api'
import type { Recipe } from '../types'

type Result = { id: string; recipe: Recipe | null; error: string | null }

// Loads one recipe. The result is tagged with its id, so when the id changes
// the previous recipe isn't shown while the next one loads.
function useRecipe(id: string) {
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    let ignore = false
    fetchRecipe(id)
      .then((recipe) => !ignore && setResult({ id, recipe, error: null }))
      .catch((err: Error) => !ignore && setResult({ id, recipe: null, error: err.message }))
    return () => {
      ignore = true
    }
  }, [id])

  return result?.id === id ? result : { id, recipe: null, error: null }
}

export default useRecipe
