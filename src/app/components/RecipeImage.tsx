import { useState } from 'react'
import { recipeImageUrls } from '../api/recipes'

type Props = { id: string; alt: string; loading?: 'lazy' | 'eager' }

// tries recipeImageUrls(id) in order, renders nothing when none exists
function RecipeImage({ id, alt, loading }: Props) {
  const urls = recipeImageUrls(id)
  const [index, setIndex] = useState(0)

  if (index >= urls.length) return null

  return (
    <img
      src={urls[index]}
      alt={alt}
      loading={loading}
      onError={() => setIndex(index + 1)}
    />
  )
}

export default RecipeImage
