import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router'
import { fetchEnums, fetchRecipes } from '../../api/recipes'
import RecipeImage from '../../components/RecipeImage'
import type { EnumItem, RecipeSummary } from '../../types/recipe'
import './HomePage.css'

// tiles rendered per infinite-scroll page
const PAGE_SIZE_DESKTOP = 12
const PAGE_SIZE_MOBILE = 6
const desktopQuery = window.matchMedia('(min-width: 768px)')

function subscribeDesktop(onChange: () => void) {
  desktopQuery.addEventListener('change', onChange)
  return () => desktopQuery.removeEventListener('change', onChange)
}

// random sort key per recipe, kept for the page load so the order survives
// filtering, infinite scroll and coming back from a detail
const randomRank = new Map<string, number>()

function rankOf(id: string) {
  let rank = randomRank.get(id)
  if (rank === undefined) {
    rank = Math.random()
    randomRank.set(id, rank)
  }
  return rank
}

function shuffle(recipes: RecipeSummary[]) {
  return [...recipes].sort((a, b) => rankOf(a.id) - rankOf(b.id))
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
  const [categories, setCategories] = useState<EnumItem[]>([])
  // filter criteria live in the URL so going back from a detail restores them
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const selected = searchParams.get('cat')?.split(',').filter(Boolean) ?? []
  const [pages, setPages] = useState(1)
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => desktopQuery.matches,
  )

  useEffect(() => {
    fetchRecipes()
      .then((list) => setRecipes(shuffle(list)))
      .catch((err: Error) => setError(err.message))
    // chips are optional – the list still works without them
    fetchEnums()
      .then((enums) => setCategories(enums.categories))
      .catch(() => {})
  }, [])

  // replace, not push – filter tweaks shouldn't pile up history entries
  const updateParam = (key: string, value: string) => {
    setSearchParams(
      (params) => {
        if (value) params.set(key, value)
        else params.delete(key)
        return params
      },
      { replace: true },
    )
    setPages(1)
  }

  const toggleCategory = (id: string) =>
    updateParam(
      'cat',
      (selected.includes(id)
        ? selected.filter((c) => c !== id)
        : [...selected, id]
      ).join(','),
    )

  // no category selected = all; otherwise the recipe must be in any selected one
  const tokens = tokenize(query)
  const matches = (recipes ?? []).filter(
    (r) =>
      (selected.length === 0 || r.category.some((c) => selected.includes(c))) &&
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
      <title>Recepty</title>
      {categories.length > 0 && (
        <div className="categories">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="chip"
              aria-pressed={selected.includes(c.id)}
              onClick={() => toggleCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <input
        className="search"
        type="search"
        placeholder="Hľadať recept alebo surovinu…"
        value={query}
        onChange={(e) => updateParam('q', e.target.value)}
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
