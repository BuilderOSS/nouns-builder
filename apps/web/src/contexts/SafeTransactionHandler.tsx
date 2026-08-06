'use client'

import { SafeTransactionModal } from '@buildeross/ui'
import {
  proposeSafeTransaction,
  registerSafeTransactionHandler,
  type SafeTransactionParams,
  unregisterSafeTransactionHandler,
} from '@buildeross/utils'
import { useEffect, useState } from 'react'

export function SafeTransactionHandler() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    params: SafeTransactionParams | null
    resolve: ((result: { safeTxHash: string }) => void) | null
    reject: ((error: Error) => void) | null
  }>({
    isOpen: false,
    params: null,
    resolve: null,
    reject: null,
  })

  // Register global handler on mount
  useEffect(() => {
    console.log('[SafeTransactionHandler] Mounted and registering handler')
    registerSafeTransactionHandler(async (params) => {
      console.log('[SafeTransactionHandler] Handler called, opening modal')
      // Show modal and wait for user interaction
      return new Promise((resolve, reject) => {
        setModalState({
          isOpen: true,
          params,
          resolve,
          reject,
        })
      })
    })

    return () => {
      unregisterSafeTransactionHandler()
    }
  }, [])

  const handleConfirm = async () => {
    if (!modalState.params) {
      return { safeTxHash: '' }
    }

    try {
      // Actually propose to Safe Service
      const safeTxHash = await proposeSafeTransaction(
        modalState.params.safeInfo,
        modalState.params.transaction,
        modalState.params.eoaProvider
      )

      // Resolve the promise that SafeOwnerProvider is waiting on
      modalState.resolve?.({ safeTxHash })

      return { safeTxHash }
    } catch (error) {
      // Reject the promise
      modalState.reject?.(error as Error)
      throw error
    }
  }

  const handleClose = () => {
    // User cancelled - reject the promise
    modalState.reject?.(new Error('User cancelled Safe transaction'))
    setModalState({
      isOpen: false,
      params: null,
      resolve: null,
      reject: null,
    })
  }

  console.log(
    '[SafeTransactionHandler] Rendering, isOpen:',
    modalState.isOpen,
    'hasParams:',
    !!modalState.params
  )

  if (!modalState.params) {
    return null
  }

  return (
    <SafeTransactionModal
      isOpen={modalState.isOpen}
      onClose={handleClose}
      safeAddress={modalState.params.safeInfo.safeAddress}
      threshold={modalState.params.safeInfo.threshold}
      ownersCount={modalState.params.safeInfo.owners.length}
      chainId={modalState.params.safeInfo.chainId}
      onConfirm={handleConfirm}
    />
  )
}
