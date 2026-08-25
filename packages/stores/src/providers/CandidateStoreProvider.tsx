import React, { createContext, ReactNode, useEffect, useState } from 'react'

import { createCandidateStore } from '../createCandidateStore'

type CandidateStoreContextType = {
  store: ReturnType<typeof createCandidateStore>
  hasHydrated: boolean
}

const CandidateStoreContext = createContext<CandidateStoreContextType | null>(null)

export const CandidateStoreProvider = ({
  store,
  children,
}: {
  store: ReturnType<typeof createCandidateStore>
  children: ReactNode
}) => {
  const [hasHydrated, setHasHydrated] = useState(false)

  useEffect(() => {
    const storeWithPersist = store as any
    if (storeWithPersist.persist) {
      if (storeWithPersist.persist.hasHydrated()) {
        setHasHydrated(true)
      } else {
        const unsubscribe = storeWithPersist.persist.onFinishHydration(() => {
          setHasHydrated(true)
        })
        return unsubscribe
      }
    } else {
      setHasHydrated(true)
    }
  }, [store])

  return (
    <CandidateStoreContext.Provider value={{ store, hasHydrated }}>
      {children}
    </CandidateStoreContext.Provider>
  )
}

export { CandidateStoreContext }
