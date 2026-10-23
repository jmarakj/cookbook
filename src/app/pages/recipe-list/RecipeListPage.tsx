import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Link, useSearchParams } from 'react-router'
import Image from '../../components/image/Image'
import useCodelists from '../../hooks/useCodelists'
import useRecipes from '../../hooks/useRecipes'
import { routes } from '../../services'
import type { RecipeSummary } from '../../types'
import './RecipeListPage.css'

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

function RecipeListPage() {
  const { recipes, error } = useRecipes()
  // chips are optional – the list still works without them
  const categories = useCodelists()?.categories.options ?? []
  // filter criteria live in the URL so going back from a detail restores them
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const selected = searchParams.get('cat')?.split(',').filter(Boolean) ?? []

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
  }

  const toggleCategory = (id: string) =>
    updateParam(
      'cat',
      (selected.includes(id)
        ? selected.filter((c) => c !== id)
        : [...selected, id]
      ).join(','),
    )

  return (
    <main>
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
        <RecipeError message={error} />
      ) : !recipes ? (
        <RecipeLoading />
      ) : (
        <RecipeResults recipes={recipes} query={query} selected={selected} />
      )}
    </main>
  )
}

function RecipeError({ message }: { message: string }) {
  return <p>{message}</p>
}

function RecipeLoading() {
  return <p>Načítavam…</p>
}

type RecipeResultsProps = {
  recipes: RecipeSummary[]
  query: string
  selected: string[]
}

function RecipeResults({ recipes, query, selected }: RecipeResultsProps) {
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => desktopQuery.matches,
  )
  // page count is tagged with the filter it was scrolled under, so changing
  // the filter starts again from the first page
  const filter = `${query}|${selected.join(',')}`
  const [paging, setPaging] = useState({ filter, pages: 1 })
  const pages = paging.filter === filter ? paging.pages : 1

  // no category selected = all; otherwise the recipe must be in any selected one
  const tokens = tokenize(query)
  const matches = recipes.filter(
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
      ([entry]) => entry.isIntersecting && setPaging({ filter, pages: pages + 1 }),
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, filter, pages])

  if (results.length === 0) return <p>Nič sa nenašlo.</p>

  return (
    <>
      <ul className="tiles">
        {results.map((r) => (
          <li key={r.id}>
            <Link to={routes.recipe.url(r.id)}>
              <div className="thumb">
                <Image src={r.image} alt="" loading="lazy" />
              </div>
              <span>{r.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      {hasMore && <div ref={sentinelRef} />}
    </>
  )
}

export default RecipeListPage
