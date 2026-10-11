import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router'
import { fetchRecipes } from '../../api/recipes'
import RecipeImage from '../../components/RecipeImage'
import type { RecipeSummary } from '../../types/recipe'
import './HomePage.css'

// tiles rendered per infinite-scroll page
const PAGE_SIZE_DESKTOP = 12
const PAGE_SIZE_MOBILE = 6
const desktopQuery = window.matchMedia('(min-width: 768px)')

function subscribeDesktop(onChange: () => void) {
  desktopQuery.addEventListener('change', onChange)
  return () => desktopQuery.removeEventListener('change', onChange)
}

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
  const [pages, setPages] = useState(1)
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => desktopQuery.matches,
  )

  useEffect(() => {
    fetchRecipes()
      .then(setRecipes)
      .catch((err: Error) => setError(err.message))
  }, [])

  const tokens = tokenize(query)
  const matches = (recipes ?? []).filter((r) =>
    tokens.every((t) => r.search.includes(t)),
  )
  const results = matches.slice(
    0,
    pages * (isDesktop ? PAGE_SIZE_DESKTOP : PAGE_SIZE_MOBILE),
  )
  const hasMore = results.length < matches.length

  // render the next page once the sentinel below the tiles nears the viewport;
  // re-observing after each page fires again if the sentinel is still visible
  const sentinelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!hasMore || !sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setPages((p) => p + 1),
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, pages])

  return (
    <main className="home">
      <input
        className="search"
        type="search"
        placeholder="Hľadať recept alebo surovinu…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setPages(1)
        }}
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
      {hasMore && <div ref={sentinelRef} />}
    </main>
  )
}

export default HomePage
