import type {
  EIP1193Provider,
  SafeInfo,
  SafeTransactionParams,
  SafeTransactionResult,
  SendTransactionParams,
} from '@buildeross/utils'
import {
  executeSafeTransaction,
  getSafeErrorMessage,
  proposeSafeTransaction,
  SafeTransactionError,
  SafeTransactionErrorCode,
} from '@buildeross/utils'
import { assign, createMachine, fromPromise } from 'xstate'

import { debugSafeTx } from '../utils/debug'

interface SafeTransactionContext {
  params: SafeTransactionParams | null
  result: SafeTransactionResult | null
  error: string | null
  resolve: ((result: SafeTransactionResult) => void) | null
  reject: ((error: Error) => void) | null
}

export type SafeTransactionEvent =
  | {
      type: 'PROPOSE'
      params: SafeTransactionParams
      resolve: (result: SafeTransactionResult) => void
      reject: (error: Error) => void
    }
  | { type: 'RETRY' }
  | { type: 'CANCEL' }
  | { type: 'CLOSE' }

export const safeTransactionMachine = createMachine(
  {
    id: 'safeTransaction',
    initial: 'idle',
    types: {} as {
      context: SafeTransactionContext
      events: SafeTransactionEvent
    },
    context: {
      params: null,
      result: null,
      error: null,
      resolve: null,
      reject: null,
    },
    states: {
      idle: {
        entry: () => debugSafeTx('State: idle'),
        on: {
          PROPOSE: {
            target: 'executing',
            actions: 'setProposalParams',
          },
        },
      },
      executing: {
        entry: () => debugSafeTx('State: executing/proposing transaction'),
        invoke: {
          src: 'executeTransaction',
          input: ({ context }) => ({
            safeInfo: context.params!.safeInfo,
            transaction: context.params!.transactions ?? context.params!.transaction,
            eoaProvider: context.params!.eoaProvider,
            mode: context.params!.mode,
          }),
          onDone: {
            target: 'success',
            actions: 'setSuccess',
          },
          onError: {
            target: 'error',
            actions: 'setError',
          },
        },
      },
      success: {
        entry: ['logSuccess', 'resolvePromises'],
        on: {
          CLOSE: 'idle',
        },
      },
      error: {
        entry: ['logError'],
        on: {
          RETRY: { target: 'executing', actions: 'clearError' },
          CANCEL: 'cancelled',
          CLOSE: 'cancelled',
        },
      },
      cancelled: {
        entry: ['logCancelled', 'rejectWithCancellation'],
        always: {
          target: 'idle',
          actions: 'resetContext',
        },
      },
    },
  },
  {
    actions: {
      setProposalParams: assign({
        params: ({ event }) => {
          if (event.type === 'PROPOSE') {
            debugSafeTx('Received transaction params (mode: %s)', event.params.mode)
            return event.params
          }
          return null
        },
        resolve: ({ event }: { event: SafeTransactionEvent }) => {
          if (event.type === 'PROPOSE') {
            return event.resolve
          }
          return null
        },
        reject: ({ event }: { event: SafeTransactionEvent }) => {
          if (event.type === 'PROPOSE') {
            return event.reject
          }
          return null
        },
        error: null,
        result: null,
      }),
      setSuccess: assign({
        result: ({ event }) => {
          if ('output' in event) {
            const result = event.output as SafeTransactionResult
            debugSafeTx('Transaction successful (mode: %s)', result.mode)
            if (result.mode === 'execute') {
              debugSafeTx('Execution txHash: %s', result.txHash)
            } else {
              debugSafeTx('Proposal safeTxHash: %s', result.safeTxHash)
            }
            return result
          }
          return null
        },
        error: null,
      }),
      setError: assign({
        error: ({ event }) => {
          if ('error' in event) {
            const err = event.error as Error
            const message = getSafeErrorMessage(err)
            debugSafeTx('Transaction error: %s', message)
            return message
          }
          return 'Failed to execute transaction'
        },
      }),
      clearError: assign({ error: null }),
      logSuccess: () => {
        debugSafeTx('State: success')
      },
      resolvePromises: ({ context }) => {
        if (context.resolve && context.result) {
          context.resolve(context.result)
          debugSafeTx('Promise resolved with result: %O', context.result)
        }
      },
      logError: () => {
        debugSafeTx('State: error')
      },
      logCancelled: () => {
        debugSafeTx('State: cancelled')
      },
      rejectWithCancellation: ({ context }) => {
        const error = new SafeTransactionError(
          context.error || 'User cancelled Safe transaction',
          SafeTransactionErrorCode.USER_CANCELLED
        )
        if (context.reject) {
          context.reject(error)
        }
        debugSafeTx('Promise rejected: %s', error.message)
      },
      resetContext: assign({
        params: null,
        result: null,
        error: null,
        resolve: null,
        reject: null,
      }),
    },
    actors: {
      executeTransaction: fromPromise<
        SafeTransactionResult,
        {
          safeInfo: SafeInfo
          transaction: SendTransactionParams | SendTransactionParams[]
          eoaProvider: EIP1193Provider
          mode: 'execute' | 'propose'
        }
      >(async ({ input }) => {
        if (input.mode === 'execute') {
          // Execute transaction immediately for 1/N Safe
          const txHash = await executeSafeTransaction(
            input.safeInfo,
            input.transaction,
            input.eoaProvider
          )
          return { txHash, mode: 'execute' }
        } else {
          // Create proposal for multi-sig Safe
          const safeTxHash = await proposeSafeTransaction(
            input.safeInfo,
            input.transaction,
            input.eoaProvider
          )
          return { safeTxHash, mode: 'propose' }
        }
      }),
    },
  }
)
