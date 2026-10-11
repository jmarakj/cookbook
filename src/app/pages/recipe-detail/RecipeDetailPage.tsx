import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { fetchEnums, fetchRecipe, labelOf } from '../../api/recipes'
import RecipeImage from '../../components/RecipeImage'
import type { Enums, Recipe } from '../../types/recipe'
import './RecipeDetailPage.css'

const MIN_SERVINGS = 2
const MAX_SERVINGS = 8

function scaleAmount(amount: number, baseYield: number, servings: number) {
  return Math.round((amount * servings * 100) / baseYield) / 100
}

function RecipeDetailPage() {
  const { id = '' } = useParams()
  // key resets all state when navigating between recipes
  return <RecipeView key={id} id={id} />
}

function RecipeView({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [enums, setEnums] = useState<Enums | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [servings, setServings] = useState<number | null>(null)

  useEffect(() => {
    let ignore = false

    fetchRecipe(id)
      .then((data) => !ignore && setRecipe(data))
      .catch((err: Error) => !ignore && setError(err.message))

    return () => {
      ignore = true
    }
  }, [id])

  useEffect(() => {
    fetchEnums()
      .then(setEnums)
      .catch(() => setEnums(null))
  }, [])

  if (error) {
    return (
      <main>
        <p>{error}</p>
      </main>
    )
  }

  if (!recipe) {
    return <main>Načítavam…</main>
  }

  const currentServings =
    servings ?? Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, recipe.yield))

  return (
    <main className="recipe">
      <RecipeImage id={id} alt={recipe.name} />

      <h1>{recipe.name}</h1>

      <ul className="tags">
        {recipe.category.map((c) => (
          <li key={c}>{labelOf(enums?.categories, c)}</li>
        ))}
      </ul>

      <dl className="times">
        <div>
          <dt>Príprava</dt>
          <dd>{recipe.times.prep} min</dd>
        </div>
        <div>
          <dt>Varenie</dt>
          <dd>{recipe.times.cook} min</dd>
        </div>
        <div>
          <dt>Odpočinok</dt>
          <dd>{recipe.times.rest} min</dd>
        </div>
        <div>
          <dt>Spolu</dt>
          <dd>{recipe.times.total} min</dd>
        </div>
      </dl>

      <h2>Ingrediencie</h2>
      <label className="servings">
        Porcie: <strong>{currentServings}</strong>
        <input
          type="range"
          min={MIN_SERVINGS}
          max={MAX_SERVINGS}
          value={currentServings}
          onChange={(e) => setServings(Number(e.target.value))}
        />
      </label>
      <table className="ingredients">
        <tbody>
          {recipe.ingredients.map((ing) => (
            <tr key={ing.id}>
              <td>
                {ing.amount != null &&
                  `${scaleAmount(ing.amount, recipe.yield, currentServings)} ${ing.unit ? labelOf(enums?.units, ing.unit) : ''}`}
              </td>
              <td>
                {labelOf(enums?.ingredients, ing.id)}
                {ing.notes && <em> ({ing.notes})</em>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Postup</h2>
      <ol className="steps">
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      {recipe.notes && (
        <>
          <h2>Poznámky</h2>
          <p>{recipe.notes}</p>
        </>
      )}
    </main>
  )
}

export default RecipeDetailPage
