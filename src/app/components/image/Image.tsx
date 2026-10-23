import { useState } from 'react'

// src is relative to public/, e.g. "images/langose.jpg"
type Props = { src: string | null; alt: string; loading?: 'lazy' | 'eager' }

// renders nothing when there is no src or the image fails to load
function Image({ src, alt, loading }: Props) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) return null

  return (
    <img
      src={`${import.meta.env.BASE_URL}${src}`}
      alt={alt}
      loading={loading}
      onError={() => setFailed(true)}
    />
  )
}

export default Image
