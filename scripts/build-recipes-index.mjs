// Builds public/recipes.json – a minified index of public/recipes/*.json for list & search –
// and optimizes oversized images in public/images.
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'

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

// Re-encodes images over 100 KB as JPEG (quality 80, max 1200 px) via PowerShell
// System.Drawing – no image tools are installed. Originals in other formats are
// replaced by <id>.jpg, which the app tries first.
const imagesDir = join(publicDir, 'images')
const MAX_IMAGE_BYTES = 100 * 1024
const MAX_IMAGE_SIZE = 1200

const optimizeImage = (src, dest) => {
  const script = `
    Add-Type -AssemblyName System.Drawing
    $img = [System.Drawing.Image]::FromFile($env:SRC)
    $scale = [Math]::Min(1, ${MAX_IMAGE_SIZE} / [Math]::Max($img.Width, $img.Height))
    $w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
    $bmp = New-Object System.Drawing.Bitmap $w, $h
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::White)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($img, 0, 0, $w, $h)
    $img.Dispose(); $g.Dispose()
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
    $params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 80L
    $bmp.Save($env:DEST, $codec, $params)
    $bmp.Dispose()
  `
  execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', script], {
    env: { ...process.env, SRC: src, DEST: dest },
    stdio: 'inherit',
  })
}

if (process.platform !== 'win32') {
  console.warn('images: skipped optimization (needs Windows PowerShell)')
} else {
  for (const file of readdirSync(imagesDir)) {
    const src = join(imagesDir, file)
    const before = statSync(src).size
    if (before <= MAX_IMAGE_BYTES || !/\.(jpe?g|png)$/i.test(file)) continue

    const dest = join(imagesDir, `${basename(file, extname(file))}.jpg`)
    const tmp = `${dest}.tmp`
    optimizeImage(src, tmp)
    const after = statSync(tmp).size
    // keep the original unless re-encoding saves at least 10 % – so already
    // optimized JPEGs aren't re-compressed (and degraded) on every build
    if (after > before * 0.9) {
      unlinkSync(tmp)
      continue
    }
    unlinkSync(src)
    renameSync(tmp, dest)
    console.log(`images: ${file} ${Math.round(before / 1024)} KB -> ${basename(dest)} ${Math.round(after / 1024)} KB`)
  }
}
