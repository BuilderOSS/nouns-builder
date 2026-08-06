import type {
  EIP1193Provider,
  SafeInfo,
  SafeTransactionParams,
  SendTransactionParams,
} from '@buildeross/utils'
import {
  proposeSafeTransaction,
  SafeTransactionError,
  SafeTransactionErrorCode,
} from '@buildeross/utils'
import { assign, createMachine, fromPromise } from 'xstate'

import { debugSafeTx } from '../utils/debug'

interface SafeTransactionContext {
  params: SafeTransactionParams | null
  safeTxHash: string | null
  error: string | null
  resolve: ((result: { safeTxHash: string }) => void) | null
  reject: ((error: Error) => void) | null
  confirmResolve: ((result: { safeTxHash: string }) => void) | null
  confirmReject: ((error: Error) => void) | null
}

export type SafeTransactionEvent =
  | {
      type: 'PROPOSE'
      params: SafeTransactionParams
      resolve: (result: { safeTxHash: string }) => void
      reject: (error: Error) => void
    }
  | {
      type: 'CONFIRM'
      resolve: (result: { safeTxHash: string }) => void
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
      safeTxHash: null,
      error: null,
      resolve: null,
      reject: null,
      confirmResolve: null,
      confirmReject: null,
    },
    states: {
      idle: {
        entry: () => debugSafeTx('State: idle'),
        on: {
          PROPOSE: {
            target: 'reviewing',
            actions: 'setProposalParams',
          },
        },
      },
      reviewing: {
        entry: () => debugSafeTx('State: reviewing (awaiting user confirmation)'),
        on: {
          CONFIRM: {
            target: 'proposing',
            actions: 'setConfirmationCallbacks',
          },
          CANCEL: 'cancelled',
          CLOSE: 'cancelled',
        },
      },
      proposing: {
        entry: () => debugSafeTx('State: proposing to Safe Service'),
        invoke: {
          src: 'proposeSafeTransaction',
          input: ({ context }) => ({
            safeInfo: context.params!.safeInfo,
            transaction: context.params!.transactions ?? context.params!.transaction,
            eoaProvider: context.params!.eoaProvider,
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
          RETRY: { target: 'reviewing', actions: 'clearError' },
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
            debugSafeTx('Received proposal params: %O', event.params)
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
        safeTxHash: null,
      }),
      setConfirmationCallbacks: assign({
        confirmResolve: ({ event }: { event: SafeTransactionEvent }) =>
          event.type === 'CONFIRM' ? event.resolve : null,
        confirmReject: ({ event }: { event: SafeTransactionEvent }) =>
          event.type === 'CONFIRM' ? event.reject : null,
      }),
      setSuccess: assign({
        safeTxHash: ({ event }) => {
          if ('output' in event) {
            const hash = event.output as string
            debugSafeTx('Transaction proposed successfully: %s', hash)
            return hash
          }
          return null
        },
        error: null,
      }),
      setError: assign({
        error: ({ event }) => {
          if ('error' in event) {
            const err = event.error as Error
            const message = err?.message || 'Failed to propose transaction'
            debugSafeTx('Transaction error: %s', message)
            return message
          }
          return 'Failed to propose transaction'
        },
      }),
      clearError: assign({ error: null }),
      logSuccess: () => {
        debugSafeTx('State: success')
      },
      resolvePromises: ({ context }) => {
        if (context.resolve && context.safeTxHash) {
          context.resolve({ safeTxHash: context.safeTxHash })
        }
        if (context.confirmResolve && context.safeTxHash) {
          context.confirmResolve({ safeTxHash: context.safeTxHash })
          debugSafeTx('Promise resolved with safeTxHash: %s', context.safeTxHash)
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
        context.confirmReject?.(error)
        debugSafeTx('Promise rejected: %s', error.message)
      },
      resetContext: assign({
        params: null,
        safeTxHash: null,
        error: null,
        resolve: null,
        reject: null,
        confirmResolve: null,
        confirmReject: null,
      }),
    },
    actors: {
      proposeSafeTransaction: fromPromise<
        string,
        {
          safeInfo: SafeInfo
          transaction: SendTransactionParams | SendTransactionParams[]
          eoaProvider: EIP1193Provider
        }
      >(async ({ input }) => {
        return await proposeSafeTransaction(
          input.safeInfo,
          input.transaction,
          input.eoaProvider
        )
      }),
    },
  }
)
