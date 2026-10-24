import type { Codelists, ShoppingItem } from '../../types'

export type ShoppingGroup = {
  key: string
  name: string
  amount: string
  aisle: string
  bought: boolean
  items: ShoppingItem[]
}

export function normalizeName(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

export function formatAmounts(items: ShoppingItem[], codelists: Codelists | null) {
  const sums = new Map<string | null, number>()
  for (const { amount, unit } of items) {
    if (amount != null) sums.set(unit, (sums.get(unit) ?? 0) + amount)
  }
  return [...sums]
    .map(([unit, sum]) => {
      const value = Math.round(sum * 100) / 100
      return unit ? `${value} ${codelists?.units.label(unit) ?? unit}` : `${value}`
    })
    .join(' + ')
}

export function groupItems(items: ShoppingItem[], codelists: Codelists | null) {
  const groups = new Map<string, ShoppingItem[]>()
  for (const item of items) {
    const key = `${item.bought ? 'bought' : 'open'}:${item.ingredientId ?? normalizeName(item.name)}`
    groups.set(key, [...(groups.get(key) ?? []), item])
  }

  const rows = [...groups].map(
    ([key, entries]): ShoppingGroup => ({
      key,
      name: entries[0].ingredientId
        ? (codelists?.ingredients.label(entries[0].ingredientId) ?? entries[0].name)
        : entries[0].name,
      amount: formatAmounts(entries, codelists),
      aisle: codelists?.groups.label(aisleOf(entries[0].ingredientId, codelists)) ?? '',
      bought: entries[0].bought,
      items: entries,
    }),
  )
  const aisles = codelists?.groups.options.map((g) => g.label) ?? []
  rows.sort(
    (a, b) =>
      aisles.indexOf(a.aisle) - aisles.indexOf(b.aisle) || a.name.localeCompare(b.name, 'sk'),
  )
  return [...rows.filter((g) => !g.bought), ...rows.filter((g) => g.bought)]
}

function aisleOf(ingredientId: string | null, codelists: Codelists | null) {
  return codelists?.ingredients.options.find((o) => o.id === ingredientId)?.group ?? 'other'
}
