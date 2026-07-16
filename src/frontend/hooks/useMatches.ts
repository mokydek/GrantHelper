import { useCallback, useEffect, useState } from 'react'
import { getMyMatches } from '../../backend/services/matchingService'
import type { GrantMatch } from '../../lib/matching/types'

// Module level cache so moving between the list and a detail page does not
// refetch. refresh() forces a fresh load.
let cache: GrantMatch[] | null = null

export function useMatches() {
  const [matches, setMatches] = useState<GrantMatch[] | null>(cache)
  const [loading, setLoading] = useState(cache === null)
  const [error, setError] = useState<Error | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getMyMatches()
      cache = result
      setMatches(result)
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Failed to load'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (cache === null) {
      void load()
    } else {
      setMatches(cache)
      setLoading(false)
    }
  }, [load])

  const refresh = useCallback(() => load(), [load])

  return { matches, loading, error, refresh }
}
