'use client'

import { SafeTransactionModal } from '@buildeross/ui'
import {
  registerSafeTransactionHandler,
  unregisterSafeTransactionHandler,
} from '@buildeross/utils'
import { useMachine } from '@xstate/react'
import { useEffect } from 'react'

import { safeTransactionMachine } from '../machines/safeTransactionMachine'
import { debugSafeTx } from '../utils/debug'

export function SafeTransactionHandler() {
  const [state, send] = useMachine(safeTransactionMachine)

  // Register global handler on mount
  useEffect(() => {
    registerSafeTransactionHandler(async (params) => {
      debugSafeTx('Handler called with params: %O', params)
      // Show modal and wait for user interaction
      return new Promise((resolve, reject) => {
        send({
          type: 'PROPOSE',
          params,
          resolve,
          reject,
        })
      })
    })

    return () => {
      unregisterSafeTransactionHandler()
    }
  }, [send])

  const handleConfirm = async () => {
    send({ type: 'CONFIRM' })
    // The promise will be resolved by the state machine with the actual safeTxHash
    // Return a dummy promise that resolves with the current safeTxHash
    return { safeTxHash: state.context.safeTxHash || '0x' }
  }

  const handleClose = () => {
    if (state.matches('error')) {
      send({ type: 'CLOSE' })
    } else if (state.matches('success')) {
      send({ type: 'CLOSE' })
    } else {
      send({ type: 'CANCEL' })
    }
  }

  // Don't render if not in a state that needs the modal
  if (state.matches('idle')) {
    return null
  }

  if (!state.context.params) {
    return null
  }

  const isOpen = !state.matches('idle')

  return (
    <SafeTransactionModal
      isOpen={isOpen}
      onClose={handleClose}
      safeAddress={state.context.params.safeInfo.safeAddress}
      threshold={state.context.params.safeInfo.threshold}
      ownersCount={state.context.params.safeInfo.owners.length}
      chainId={state.context.params.safeInfo.chainId}
      targetAddress={state.context.params.transaction.to}
      txValue={state.context.params.transaction.value}
      txData={state.context.params.transaction.data}
      onConfirm={handleConfirm}
    />
  )
}
