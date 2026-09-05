'use client'

import { SafeTransactionModal } from '@buildeross/ui'
import {
  registerSafeTransactionHandler,
  SafeTransactionError,
  SafeTransactionErrorCode,
  unregisterSafeTransactionHandler,
} from '@buildeross/utils'
import { useMachine } from '@xstate/react'
import { useEffect, useRef } from 'react'

import { safeTransactionMachine } from '../machines/safeTransactionMachine'
import { debugSafeTx } from '../utils/debug'

export function SafeTransactionHandler() {
  const [state, send] = useMachine(safeTransactionMachine)
  const stateRef = useRef(state)
  stateRef.current = state

  // Register global handler on mount
  useEffect(() => {
    registerSafeTransactionHandler(async (params) => {
      debugSafeTx('Handler called with params: %O', params)

      // Reject new transactions if one is already in progress
      if (!stateRef.current.matches('idle')) {
        debugSafeTx('ERROR: Transaction already in progress, rejecting new transaction')
        throw new SafeTransactionError(
          'Another Safe transaction is already in progress. Please complete or cancel it first.',
          SafeTransactionErrorCode.TRANSACTION_IN_PROGRESS
        )
      }

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
    return new Promise<{ safeTxHash: string }>((resolve, reject) => {
      send({ type: 'CONFIRM', resolve, reject })
    })
  }

  const handleClose = () => {
    const event = state.matches('error') || state.matches('success') ? 'CLOSE' : 'CANCEL'
    send({ type: event })
  }

  const handleRetry = () => {
    send({ type: 'RETRY' })
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
      onRetry={handleRetry}
      safeAddress={state.context.params.safeInfo.safeAddress}
      threshold={state.context.params.safeInfo.threshold}
      ownersCount={state.context.params.safeInfo.owners.length}
      chainId={state.context.params.safeInfo.chainId}
      targetAddress={state.context.params.transaction.to}
      txValue={state.context.params.transaction.value}
      txData={state.context.params.transaction.data}
      transactions={(
        state.context.params.transactions ?? [state.context.params.transaction]
      ).map((transaction) => ({
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
      }))}
      onConfirm={handleConfirm}
    />
  )
}
