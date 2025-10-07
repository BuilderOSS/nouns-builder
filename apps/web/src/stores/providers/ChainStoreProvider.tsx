import React, { createContext, ReactNode, useEffect, useState } from 'react'

import { createChainStore } from '../createChainStore'

type ChainStoreContextType = {
  store: ReturnType<typeof createChainStore>
  hasHydrated: boolean
}

const ChainStoreContext = createContext<ChainStoreContextType | null>(null)

export const ChainStoreProvider = ({
  store,
  children,
}: {
  store: ReturnType<typeof createChainStore>
  children: ReactNode
}) => {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    // Check if the store has persist middleware
    const storeWithPersist = store as any
    if (storeWithPersist.persist) {
      // Check if already hydrated
      if (storeWithPersist.persist.hasHydrated()) {
        setHasHydrated(true)
      } else {
        // Subscribe to hydration completion
        const unsubscribe = storeWithPersist.persist.onFinishHydration(() => {
          setHasHydrated(true)
        })
        return unsubscribe
      }
    } else {
      // If no persist middleware, consider it hydrated immediately
      setHasHydrated(true)
    }
  }, [store])

  return (
    <ChainStoreContext.Provider value={{ store, hasHydrated }}>
      {children}
    </ChainStoreContext.Provider>
  )
}

export { ChainStoreContext }
