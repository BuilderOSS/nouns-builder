import { CHAIN_ID } from '@buildeross/types'
import { isOwnerOfSafe, isSafeAddress } from '@buildeross/utils/safeService'
import { clearSafeInfo, getSavedSafeInfo } from '@buildeross/utils/safeStorage'
import { useCallback, useEffect, useState } from 'react'
import type { Address } from 'viem'

export interface SafeAuthState {
  safeAddress: Address | null
  chainId: CHAIN_ID | null
  isValidating: boolean
  error: string | null
}

export interface UseSafeAuthReturn {
  state: SafeAuthState
  setSafeInfo: (safeAddress: Address, chainId: CHAIN_ID) => Promise<boolean>
  validateSafeAddress: (safeAddress: Address, chainId: CHAIN_ID) => Promise<boolean>
  validateOwner: (
    ownerAddress: Address,
    safeAddress: Address,
    chainId: CHAIN_ID
  ) => Promise<boolean>
  clearSafe: () => void
  loadSaved: () => void
}

export function useSafeAuth(): UseSafeAuthReturn {
  const [state, setState] = useState<SafeAuthState>({
    safeAddress: null,
    chainId: null,
    isValidating: false,
    error: null,
  })

  const loadSaved = useCallback(() => {
    const saved = getSavedSafeInfo()
    if (saved) {
      setState({
        safeAddress: saved.safeAddress,
        chainId: saved.chainId as CHAIN_ID,
        isValidating: false,
        error: null,
      })
    }
  }, [])

  const validateSafeAddress = useCallback(
    async (safeAddress: Address, chainId: CHAIN_ID) => {
      setState((prev) => ({ ...prev, isValidating: true, error: null }))

      try {
        const isValid = await isSafeAddress(safeAddress, chainId)

        if (!isValid) {
          setState((prev) => ({
            ...prev,
            isValidating: false,
            error: 'This address is not a Safe on the selected network',
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
          error: 'Failed to validate Safe address',
        }))
        return false
      }
    },
    []
  )

  const validateOwner = useCallback(
    async (ownerAddress: Address, safeAddress: Address, chainId: CHAIN_ID) => {
      setState((prev) => ({ ...prev, isValidating: true, error: null }))

      try {
        const isValid = await isOwnerOfSafe(ownerAddress, safeAddress, chainId)

        if (!isValid) {
          setState((prev) => ({
            ...prev,
            isValidating: false,
            error: 'Your wallet is not an owner of this Safe',
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
          error: 'Failed to validate Safe ownership',
        }))
        return false
      }
    },
    []
  )

  const setSafeInfo = useCallback(async (safeAddress: Address, chainId: CHAIN_ID) => {
    setState({
      safeAddress,
      chainId,
      isValidating: false,
      error: null,
    })

    // Persistence is handled by the app-level wallet flow during connection.
    // This hook only manages React state for the auth adapter.
    return true
  }, [])

  const clearSafe = useCallback(() => {
    setState({
      safeAddress: null,
      chainId: null,
      isValidating: false,
      error: null,
    })
    clearSafeInfo()
  }, [])

  // Load saved Safe info on mount
  useEffect(() => {
    loadSaved()
  }, [loadSaved])

  return {
    state,
    setSafeInfo,
    validateSafeAddress,
    validateOwner,
    clearSafe,
    loadSaved,
  }
}
