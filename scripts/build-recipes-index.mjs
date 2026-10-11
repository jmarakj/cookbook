// Builds public/recipes.json – a minified index of public/recipes/*.json for list & search.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'

const publicDir = join(import.meta.dirname, '..', 'public')
const recipesDir = join(publicDir, 'recipes')

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const enums = readJson(join(publicDir, 'enums.json'))
const label = (items, id) => items.find((item) => item.id === id)?.label ?? id

// lowercase, without diacritics, unique words – so "Langoše" matches "langose"
const normalize = (texts) => [
  ...new Set(
    texts
      .join(' ')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  ),
].join(' ')

const index = readdirSync(recipesDir)
  .filter((file) => file.endsWith('.json'))
  .sort()
  .map((file) => {
    const recipe = readJson(join(recipesDir, file))
    return {
      // file name, because detail page loads recipes/<id>.json
      id: basename(file, '.json'),
      name: recipe.name,
      search: normalize([
        recipe.name,
        ...recipe.category.map((c) => label(enums.categories, c)),
        ...recipe.ingredients.map((i) => label(enums.ingredients, i.id)),
      ]),
    }
  })

writeFileSync(join(publicDir, 'recipes.json'), JSON.stringify(index))
console.log(`recipes.json: ${index.length} recipes`)
