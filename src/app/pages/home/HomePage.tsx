import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchRecipes } from '../../api/recipes'
import RecipeImage from '../../components/RecipeImage'
import type { RecipeSummary } from '../../types/recipe'
import './HomePage.css'

const MAX_RESULTS = 12

// same normalization as scripts/build-recipes-index.mjs
function tokenize(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function HomePage() {
  const [recipes, setRecipes] = useState<RecipeSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((err: Error) => setError(err.message))
  }, [])

  const tokens = tokenize(query)
  const results = (recipes ?? [])
    .filter((r) => tokens.every((t) => r.search.includes(t)))
    .slice(0, MAX_RESULTS)

  return (
    <main className="home">
      <input
        className="search"
        type="search"
        placeholder="Hľadať recept alebo surovinu…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />

      {error ? (
        <p>{error}</p>
      ) : !recipes ? (
        <p>Načítavam…</p>
      ) : results.length === 0 ? (
        <p>Nič sa nenašlo.</p>
      ) : (
        <ul className="tiles">
          {results.map((r) => (
            <li key={r.id}>
              <Link to={`/detail/${encodeURIComponent(r.id)}`}>
                <div className="thumb">
                  <RecipeImage id={r.id} alt="" loading="lazy" />
                </div>
                <span>{r.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default HomePage
