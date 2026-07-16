import { useEffect } from 'react'

const APP_NAME = 'GrantHelper'

// Sets document.title to "{name} · GrantHelper", or just "GrantHelper" when
// name is empty (the landing page).
export function usePageTitle(name: string): void {
  useEffect(() => {
    document.title = name ? `${name} · ${APP_NAME}` : APP_NAME
  }, [name])
}
