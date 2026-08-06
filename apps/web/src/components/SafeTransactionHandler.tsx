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
    registerSafeTransactionHandler(async (params) => {
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
      return { safeTxHash: '0x' }
    }

    try {
      // Actually propose to Safe Service
      const safeTxHash = await proposeSafeTransaction(
        modalState.params.safeInfo,
        modalState.params.transaction,
        modalState.params.eoaProvider
      )

      // Resolve the promise that SafeOwnerProvider is waiting on
      // Return empty hash so wagmi's waitForTransactionReceipt fails quickly
      // (Safe transactions are only proposed, not executed yet, so no on-chain tx to wait for)
      modalState.resolve?.({ safeTxHash: '0x' })

      return { safeTxHash }
    } catch (error) {
      // Reject the promise
      modalState.reject?.(error as Error)
      throw error
    }
  }

  const handleClose = () => {
    // Only reject if transaction wasn't confirmed yet
    // (if it was confirmed, promise is already resolved)
    if (modalState.reject) {
      modalState.reject(new Error('User cancelled Safe transaction'))
    }
    setModalState({
      isOpen: false,
      params: null,
      resolve: null,
      reject: null,
    })
  }

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
      targetAddress={modalState.params.transaction.to}
      txValue={modalState.params.transaction.value}
      txData={modalState.params.transaction.data}
      onConfirm={handleConfirm}
    />
  )
}
