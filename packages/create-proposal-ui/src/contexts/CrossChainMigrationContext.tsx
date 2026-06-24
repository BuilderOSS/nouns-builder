import { AddressType, CHAIN_ID } from '@buildeross/types'
import React, { createContext, ReactNode, useContext } from 'react'

interface CrossChainMigrationContextValue {
  chainId: CHAIN_ID
  tokenAddress: AddressType
}

const CrossChainMigrationContext = createContext<CrossChainMigrationContextValue | null>(
  null
)

export function CrossChainMigrationProvider({
  chainId,
  tokenAddress,
  children,
}: {
  chainId: CHAIN_ID
  tokenAddress: AddressType
  children: ReactNode
}) {
  return (
    <CrossChainMigrationContext.Provider value={{ chainId, tokenAddress }}>
      {children}
    </CrossChainMigrationContext.Provider>
  )
}

export function useCrossChainMigrationContext() {
  const context = useContext(CrossChainMigrationContext)
  // Return null if not in a provider (optional context)
  return context
}
