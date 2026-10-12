import { Codelist, type CodelistItem, type Codelists } from '../types'

const base = import.meta.env.BASE_URL

let codelists: Promise<Codelists> | null = null

// loaded once and shared by all pages; a failed load is retried next time
export function fetchCodelists(): Promise<Codelists> {
  codelists ??= loadCodelists().catch((err) => {
    codelists = null
    throw err
  })
  return codelists
}

async function loadCodelists(): Promise<Codelists> {
  const res = await fetch(`${base}enums.json`)
  if (!res.ok) throw new Error('Nepodarilo sa načítať číselníky')
  const raw: Record<keyof Codelists, CodelistItem[]> = await res.json()
  return {
    categories: new Codelist(raw.categories),
    units: new Codelist(raw.units),
    ingredients: new Codelist(raw.ingredients),
  }
}
