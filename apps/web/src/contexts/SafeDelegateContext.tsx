'use client'

import { createContext, type ReactNode, useContext, useState } from 'react'
import type { Address } from 'viem'

interface SafeDelegateContextValue {
  safeAddress: Address | null
  chainId: number | null
  setSafeDelegateInfo: (safeAddress: Address, chainId: number) => void
  clearSafeDelegateInfo: () => void
}

const SafeDelegateContext = createContext<SafeDelegateContextValue | undefined>(undefined)

export function SafeDelegateProvider({ children }: { children: ReactNode }) {
  const [safeDelegateInfo, setSafeDelegateInfoState] = useState<{
    safeAddress: Address | null
    chainId: number | null
  }>({ safeAddress: null, chainId: null })

  const setSafeDelegateInfo = (safeAddress: Address, chainId: number) => {
    setSafeDelegateInfoState({ safeAddress, chainId })
  }

  const clearSafeDelegateInfo = () => {
    setSafeDelegateInfoState({ safeAddress: null, chainId: null })
  }

  return (
    <SafeDelegateContext.Provider
      value={{
        ...safeDelegateInfo,
        setSafeDelegateInfo,
        clearSafeDelegateInfo,
      }}
    >
      {children}
    </SafeDelegateContext.Provider>
  )
}

export function useSafeDelegateContext() {
  const context = useContext(SafeDelegateContext)
  if (context === undefined) {
    throw new Error('useSafeDelegateContext must be used within a SafeDelegateProvider')
  }
  return context
}
