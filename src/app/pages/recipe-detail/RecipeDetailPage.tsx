import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { fetchEnums, fetchRecipe, labelOf } from '../../api/recipes'
import RecipeImage from '../../components/RecipeImage'
import useWakeLock from '../../hooks/useWakeLock'
import type { Enums, Recipe } from '../../types/recipe'
import './RecipeDetailPage.css'

const MIN_SERVINGS = 2
const MAX_SERVINGS = 8
const SERVINGS_STEP = 2

// Kitchen-measurable step for a scaled amount, e.g. 233.25 ml -> 250 ml
function roundingStep(amount: number, unit: string | null) {
  switch (unit) {
    case 'g':
    case 'ml':
      if (amount < 10) return 1
      if (amount < 50) return 5
      if (amount < 200) return 10
      if (amount < 1000) return 50
      return 100
    case 'kg':
    case 'l':
    case 'tsp':
      return 0.25
    case 'tbsp':
    case 'pcs':
      return 0.5
    case 'pinch':
      return 1
    default:
      return 0.25
  }
}

function scaleAmount(amount: number, unit: string | null, baseYield: number, servings: number) {
  if (servings === baseYield) return amount
  const scaled = (amount * servings) / baseYield
  const step = roundingStep(scaled, unit)
  // Never round a non-zero amount down to 0 – fall back to the smallest step
  return Math.max(step, Math.round(scaled / step) * step)
}

// mobile only (hidden by CSS) – installed PWAs on iOS have no browser back button
function BackLink() {
  const location = useLocation()
  const navigate = useNavigate()
  // 'default' = first entry in this tab (shared link, relaunch) – nothing to go back to
  const hasHistory = location.key !== 'default'
  return (
    <Link
      to="/"
      className="back"
      onClick={(e) => {
        if (!hasHistory) return
        // real back, so the home page restores its filters from the URL
        e.preventDefault()
        navigate(-1)
      }}
    >
      Späť
    </Link>
  )
}

function RecipeDetailPage() {
  const { id = '' } = useParams()
  // keep the screen on while cooking
  useWakeLock()
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
        <BackLink />
        <p>{error}</p>
      </main>
    )
  }

  if (!recipe) {
    return (
      <main>
        <BackLink />
        Načítavam…
      </main>
    )
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
      <title>{`${recipe.name}`}</title>
      <BackLink />
      <div className="columns">
        <section>
          <RecipeImage id={id} alt={recipe.name} />
        </section>

        <section className="title">
          {/* wrapper keeps normal block flow so the items' margins collapse as usual */}
          <div>
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
          </div>
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
                      `${baseYield != null && currentServings != null ? scaleAmount(ing.amount, ing.unit, baseYield, currentServings) : ing.amount} ${ing.unit ? labelOf(enums?.units, ing.unit) : ''}`}
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
