import React, { createContext, ReactNode, useEffect, useState } from 'react'

import { createProposalStore } from '../createProposalStore'

type ProposalStoreContextType = {
  store: ReturnType<typeof createProposalStore>
  hasHydrated: boolean
}

const ProposalStoreContext = createContext<ProposalStoreContextType | null>(null)

export const ProposalStoreProvider = ({
  store,
  children,
}: {
  store: ReturnType<typeof createProposalStore>
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
    <ProposalStoreContext.Provider value={{ store, hasHydrated }}>
      {children}
    </ProposalStoreContext.Provider>
  )
}

export { ProposalStoreContext }
