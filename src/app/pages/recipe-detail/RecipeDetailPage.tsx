import { ListCheck, ListPlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { setLastSeenRecipe } from '../../api'
import BackLink from '../../components/back-link/BackLink'
import PageHeader from '../../components/page-header/PageHeader'
import Image from '../../components/image/Image'
import useCodelists from '../../hooks/useCodelists'
import useRecipe from '../../hooks/useRecipe'
import useShoppingList from '../../hooks/useShoppingList'
import useWakeLock from '../../hooks/useWakeLock'
import type { Recipe } from '../../types'
import './RecipeDetailPage.css'

// the slider snaps to these values, so its positions map to indexes here
const SERVINGS_OPTIONS = [2, 3, 4, 6, 8, 10, 12]

// smallest option that feeds the whole recipe, or the largest one
function defaultServings(baseYield: number) {
  return SERVINGS_OPTIONS.find((o) => o >= baseYield) ?? SERVINGS_OPTIONS.at(-1)!
}

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

function RecipeDetailPage() {
  // keep the screen on while cooking
  useWakeLock();

  const { id = '' } = useParams()
  const { recipe, error } = useRecipe(id)

  if (error) return <RecipeError message={error} />
  if (!recipe) return <RecipeLoading />

  return <RecipeView key={recipe.id} recipe={recipe} />
}

function RecipeError({ message }: { message: string }) {
  return (
    <main>
      <PageHeader left={<BackLink />} />
      <p>{message}</p>
    </main>
  )
}

function RecipeLoading() {
  return (
    <main>
      <PageHeader left={<BackLink />} />
      Načítavam…
    </main>
  )
}

function RecipeView({ recipe }: { recipe: Recipe }) {
  const codelists = useCodelists()
  const [servings, setServings] = useState<number | null>(null)
  const shopping = useShoppingList()

  useEffect(() => setLastSeenRecipe(recipe), [recipe])

  const baseYield = recipe.yield
  const currentServings =
    baseYield == null
      ? null
      : (servings ?? defaultServings(baseYield))

  const amountFor = (amount: number, unit: string | null) =>
    baseYield != null && currentServings != null
      ? scaleAmount(amount, unit, baseYield, currentServings)
      : amount

  const inShoppingList = shopping.items?.some((i) => i.recipeId === recipe.id) ?? false

  const toggleShoppingList = () => {
    if (inShoppingList) {
      shopping.removeRecipe(recipe.id)
      return
    }
    shopping.add(
      recipe.ingredients.map((ing) => ({
        ingredientId: ing.id,
        name: codelists?.ingredients.label(ing.id) ?? ing.id,
        amount: ing.amount == null ? null : amountFor(ing.amount, ing.unit),
        unit: ing.unit,
        recipeId: recipe.id,
      })),
    )
  }

  return (
    <main className="recipe">
      <title>{`${recipe.name}`}</title>
      <PageHeader
        left={<BackLink />}
        right={
          <button
            type="button"
            aria-label={inShoppingList ? 'Odobrať z nákupného zoznamu' : 'Pridať do nákupného zoznamu'}
            title={inShoppingList ? 'Odobrať z nákupného zoznamu' : 'Pridať do nákupného zoznamu'}
            aria-pressed={inShoppingList}
            disabled={!shopping.items}
            onClick={toggleShoppingList}
          >
            {inShoppingList ? <ListCheck aria-hidden="true" /> : <ListPlus aria-hidden="true" />}
          </button>
        }
      />
      <div className="columns">
        <section>
          <Image src={recipe.image} alt={recipe.name} />
        </section>

        <section className="title">
          {/* wrapper keeps normal block flow so the items' margins collapse as usual */}
          <div>
            <h1>
              {recipe.name}
            </h1>

            <ul className="tags">
              {recipe.category.map((c) => (
                <li key={c}>{codelists?.categories.label(c) ?? c}</li>
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
                min={0}
                max={SERVINGS_OPTIONS.length - 1}
                step={1}
                value={SERVINGS_OPTIONS.indexOf(currentServings)}
                onChange={(e) => setServings(SERVINGS_OPTIONS[Number(e.target.value)])}
              />
            </label>
          )}
          <table className="ingredients">
            <tbody>
              {recipe.ingredients.map((ing) => (
                <tr key={ing.id}>
                  <td>
                    {ing.amount != null &&
                      `${amountFor(ing.amount, ing.unit)} ${ing.unit ? (codelists?.units.label(ing.unit) ?? ing.unit) : ''}`}
                  </td>
                  <td>
                    {codelists?.ingredients.label(ing.id) ?? ing.id}
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
