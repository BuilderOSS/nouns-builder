import type {
  EIP1193Provider,
  SafeInfo,
  SafeTransactionParams,
  SendTransactionParams,
} from '@buildeross/utils'
import { proposeSafeTransaction } from '@buildeross/utils'
import { assign, createMachine, fromPromise } from 'xstate'

import { debugSafeTx } from '../utils/debug'

interface SafeTransactionContext {
  params: SafeTransactionParams | null
  safeTxHash: string | null
  error: string | null
  resolve: ((result: { safeTxHash: string }) => void) | null
  reject: ((error: Error) => void) | null
}

export type SafeTransactionEvent =
  | {
      type: 'PROPOSE'
      params: SafeTransactionParams
      resolve: (result: { safeTxHash: string }) => void
      reject: (error: Error) => void
    }
  | { type: 'CONFIRM' }
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
          CONFIRM: 'proposing',
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
            transaction: context.params!.transaction,
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
        entry: [
          ({ context }) => {
            debugSafeTx('State: success')
            // Resolve promise as side effect in entry
            if (context.resolve && context.safeTxHash) {
              context.resolve({ safeTxHash: context.safeTxHash })
              debugSafeTx('Promise resolved with safeTxHash: %s', context.safeTxHash)
            } else if (context.resolve) {
              // Fallback to empty hash if somehow safeTxHash is not set
              context.resolve({ safeTxHash: '0x' })
              debugSafeTx('Promise resolved with empty hash (no safeTxHash in context)')
            }
          },
        ],
        on: {
          CLOSE: 'idle',
        },
      },
      error: {
        entry: () => debugSafeTx('State: error'),
        on: {
          RETRY: 'reviewing',
          CANCEL: 'cancelled',
          CLOSE: 'cancelled',
        },
      },
      cancelled: {
        entry: [
          ({ context }) => {
            debugSafeTx('State: cancelled')
            // Reject promise as side effect in entry
            if (context.reject) {
              const error = new Error(context.error || 'User cancelled Safe transaction')
              context.reject(error)
              debugSafeTx('Promise rejected: %s', error.message)
            }
          },
        ],
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
      resetContext: assign({
        params: null,
        safeTxHash: null,
        error: null,
        resolve: null,
        reject: null,
      }),
    },
    actors: {
      proposeSafeTransaction: fromPromise<
        string,
        {
          safeInfo: SafeInfo
          transaction: SendTransactionParams
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
