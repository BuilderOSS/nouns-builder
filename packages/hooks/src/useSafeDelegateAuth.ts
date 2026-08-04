import { CHAIN_ID } from '@buildeross/types'
import {
  clearSafeDelegate,
  getSavedSafeDelegate,
  setSafeDelegate,
} from '@buildeross/utils/safeDelegateStorage'
import { isDelegateForSafe } from '@buildeross/utils/safeService'
import { useCallback, useEffect, useState } from 'react'
import type { Address } from 'viem'

export interface SafeDelegateState {
  safeAddress: Address | null
  chainId: CHAIN_ID | null
  isValidating: boolean
  error: string | null
}

export interface UseSafeDelegateAuthReturn {
  state: SafeDelegateState
  setSafeDelegateInfo: (safeAddress: Address, chainId: CHAIN_ID) => Promise<boolean>
  validateDelegate: (
    delegateAddress: Address,
    safeAddress: Address,
    chainId: CHAIN_ID
  ) => Promise<boolean>
  clearDelegate: () => void
  loadSaved: () => void
}

export function useSafeDelegateAuth(): UseSafeDelegateAuthReturn {
  const [state, setState] = useState<SafeDelegateState>({
    safeAddress: null,
    chainId: null,
    isValidating: false,
    error: null,
  })

  const loadSaved = useCallback(() => {
    const saved = getSavedSafeDelegate()
    if (saved) {
      setState({
        safeAddress: saved.safeAddress,
        chainId: saved.chainId as CHAIN_ID,
        isValidating: false,
        error: null,
      })
    }
  }, [])

  const validateDelegate = useCallback(
    async (delegateAddress: Address, safeAddress: Address, chainId: CHAIN_ID) => {
      setState((prev) => ({ ...prev, isValidating: true, error: null }))

      try {
        const isValid = await isDelegateForSafe(delegateAddress, safeAddress, chainId)

        if (!isValid) {
          setState((prev) => ({
            ...prev,
            isValidating: false,
            error: 'Your wallet is not a delegate for this Safe',
          }))
          return false
        }

        setState((prev) => ({
          ...prev,
          isValidating: false,
          error: null,
        }))
        return true
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isValidating: false,
          error: 'Failed to validate delegate status',
        }))
        return false
      }
    },
    []
  )

  const setSafeDelegateInfo = useCallback(
    async (safeAddress: Address, chainId: CHAIN_ID) => {
      setState({
        safeAddress,
        chainId,
        isValidating: false,
        error: null,
      })

      // Save to localStorage
      setSafeDelegate(safeAddress, chainId)
      return true
    },
    []
  )

  const clearDelegate = useCallback(() => {
    setState({
      safeAddress: null,
      chainId: null,
      isValidating: false,
      error: null,
    })
    clearSafeDelegate()
  }, [])

  // Load saved delegate info on mount
  useEffect(() => {
    loadSaved()
  }, [loadSaved])

  return {
    state,
    setSafeDelegateInfo,
    validateDelegate,
    clearDelegate,
    loadSaved,
  }
}
