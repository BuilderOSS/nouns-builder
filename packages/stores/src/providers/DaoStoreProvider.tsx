import React, { createContext, ReactNode } from 'react'

import { createDaoStore } from '../createDaoStore'

const DaoStoreContext = createContext<ReturnType<typeof createDaoStore> | null>(null)

export const DaoStoreProvider = ({
  store,
  children,
}: {
  store: ReturnType<typeof createDaoStore>
  children: ReactNode
}) => <DaoStoreContext.Provider value={store}>{children}</DaoStoreContext.Provider>

export { DaoStoreContext }
