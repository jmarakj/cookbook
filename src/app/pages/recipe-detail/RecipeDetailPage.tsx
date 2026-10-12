import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { fetchEnums, fetchRecipe, labelOf } from '../../api/recipes'
import RecipeImage from '../../components/RecipeImage'
import type { Enums, Recipe } from '../../types/recipe'
import './RecipeDetailPage.css'

const MIN_SERVINGS = 2
const MAX_SERVINGS = 8
const SERVINGS_STEP = 2

function scaleAmount(amount: number, baseYield: number, servings: number) {
  if (servings === baseYield) return amount
  const scaled = (amount * servings) / baseYield
  // Round to the nearest quarter; keep tiny amounts (e.g. a pinch) from collapsing to 0
  const quarters = Math.round(scaled * 4) / 4
  return quarters > 0 ? quarters : Math.round(scaled * 100) / 100
}

function RecipeDetailPage() {
  const { id = '' } = useParams()
  // key resets all state when navigating between recipes
  return <RecipeView key={id} id={id} />
}

function BackButton() {
  const location = useLocation()
  const navigate = useNavigate()
  // 'default' key means the page was opened directly, with no in-app history
  const hasHistory = location.key !== 'default'

  return (
    <Link
      to="/"
      className="back"
      onClick={(e) => {
        if (hasHistory) {
          e.preventDefault()
          navigate(-1)
        }
      }}
    >
      ← Späť
    </Link>
  )
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

  const baseYield = recipe.yield
  const currentServings =
    baseYield == null
      ? null
      : (servings ??
        Math.min(
          MAX_SERVINGS,
          Math.max(MIN_SERVINGS, Math.ceil(baseYield / SERVINGS_STEP) * SERVINGS_STEP),
        ))

  return (
    <main className="recipe">
      <div className="top">
        <BackButton />
      </div>

      <div className="columns">
        <section>
          <RecipeImage id={id} alt={recipe.name} />
        </section>

        <section>
          <h1>
            {recipe.name}
          </h1>

          <ul className="tags">
            {recipe.category.map((c) => (
              <li key={c}>{labelOf(enums?.categories, c)}</li>
            ))}
          </ul>

          <dl className="times">
            {(
              [
                ['Príprava', recipe.times.prep],
                ['Varenie', recipe.times.cook],
                ['Čakanie', recipe.times.rest],
                ['Spolu', recipe.times.total],
              ] as const
            )
              .filter(([, minutes]) => minutes)
              .map(([label, minutes]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{minutes} min</dd>
                </div>
              ))}
          </dl>
        </section>
      </div>

      <div className="columns">
        <section>
          <h2>Ingrediencie</h2>
          {currentServings != null && (
            <label className="servings">
              Porcie: <strong>{currentServings}</strong>
              <input
                type="range"
                min={MIN_SERVINGS}
                max={MAX_SERVINGS}
                step={SERVINGS_STEP}
                value={currentServings}
                onChange={(e) => setServings(Number(e.target.value))}
              />
            </label>
          )}
          <table className="ingredients">
            <tbody>
              {recipe.ingredients.map((ing) => (
                <tr key={ing.id}>
                  <td>
                    {ing.amount != null &&
                      `${baseYield != null && currentServings != null ? scaleAmount(ing.amount, baseYield, currentServings) : ing.amount} ${ing.unit ? labelOf(enums?.units, ing.unit) : ''}`}
                  </td>
                  <td>
                    {labelOf(enums?.ingredients, ing.id)}
                    {ing.notes && <em> ({ing.notes})</em>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
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
        </section>
      </div>
    </main>
  )
}

export default RecipeDetailPage
