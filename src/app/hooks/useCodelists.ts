import { useEffect, useState } from 'react'
import { fetchCodelists } from '../api'
import type { Codelists } from '../types'

// Codelists are optional for every page – null while loading or when the
// load fails, so callers fall back to showing raw ids.
function useCodelists() {
  const [codelists, setCodelists] = useState<Codelists | null>(null)

  useEffect(() => {
    let ignore = false
    fetchCodelists()
      .then((data) => !ignore && setCodelists(data))
      .catch(() => {})
    return () => {
      ignore = true
    }
  }, [])

  return codelists
}

export default useCodelists
