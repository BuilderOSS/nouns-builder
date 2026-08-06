import {
  getSafeInfo as getSafeInfoFromChain,
  setSafeInfo as saveSafeInfo,
} from '@buildeross/utils'
import type { Address } from 'viem'
import type { Connector } from 'wagmi'
import { assign, createMachine, fromPromise } from 'xstate'

import type { AuthError, SafeInfo, WalletInfo } from '../types/auth'
import { debugWallet } from '../utils/debug'
import {
  markSiweAuthVerified,
  SIWE_REFRESH_EVENT,
  SIWE_VERIFY_PATH,
} from '../utils/siweAuthFlow'

// Delay before closing modal after successful authentication
const MODAL_CLOSE_DELAY_MS = 500

interface WalletModalContext {
  wallets: WalletInfo[]
  selectedWalletId: string | null
  address: Address | null
  connector: Connector | null
  safeInfo: SafeInfo | null
  pendingSafeInfo: SafeInfo | null
  pendingSafeAddress: Address | null
  pendingSafeChainId: number | null
  message: string | null
  signature: string | null
  error: AuthError | null
  isSafeMode: boolean
}

export type WalletModalEvent =
  | { type: 'OPEN'; wallets: WalletInfo[] }
  | { type: 'CLOSE' }
  | { type: 'SELECT_WALLET'; walletId: string }
  | { type: 'SELECT_SAFE' }
  | { type: 'SUBMIT_SAFE_ADDRESS'; address: Address; chainId: number }
  | { type: 'BACK' }
  | { type: 'WALLET_CONNECTED'; address: Address; connector: Connector }
  | { type: 'SAFE_VALIDATED'; safeInfo: SafeInfo }
  | { type: 'SIGN_MESSAGE' }
  | { type: 'SIGNATURE_RECEIVED'; signature: string; message: string }
  | { type: 'AUTHENTICATION_COMPLETE' }
  | { type: 'ERROR'; error: AuthError }
  | { type: 'RETRY' }
  | { type: 'CANCEL' }

export const walletModalMachine = createMachine(
  {
    id: 'walletModal',
    initial: 'closed',
    types: {} as {
      context: WalletModalContext
      events: WalletModalEvent
    },
    context: {
      wallets: [],
      selectedWalletId: null,
      address: null,
      connector: null,
      safeInfo: null,
      pendingSafeInfo: null,
      pendingSafeAddress: null,
      pendingSafeChainId: null,
      message: null,
      signature: null,
      error: null,
      isSafeMode: false,
    },
    states: {
      closed: {
        on: {
          OPEN: {
            target: 'selectingWallet',
            actions: 'setWallets',
          },
        },
      },
      selectingWallet: {
        entry: () => debugWallet('State: selectingWallet'),
        on: {
          SELECT_WALLET: {
            target: 'connectingWallet',
            actions: 'setSelectedWallet',
          },
          SELECT_SAFE: 'enteringSafeAddress',
          CLOSE: 'closed',
        },
      },
      enteringSafeAddress: {
        entry: () => debugWallet('State: enteringSafeAddress'),
        on: {
          SUBMIT_SAFE_ADDRESS: {
            target: 'validatingSafe',
            actions: 'setPendingSafeAddress',
          },
          BACK: 'selectingWallet',
          CLOSE: 'closed',
        },
      },
      validatingSafe: {
        entry: () =>
          debugWallet('State: validatingSafe (waiting for component validation)'),
        after: {
          15000: {
            target: 'enteringSafeAddress',
            actions: 'setTimeoutError',
          },
        },
        on: {
          SAFE_VALIDATED: {
            target: 'checkingIfConnected',
            actions: 'setPendingSafeInfo',
          },
          ERROR: {
            target: 'enteringSafeAddress',
            actions: 'setValidationError',
          },
          CLOSE: 'closed',
        },
      },
      checkingIfConnected: {
        always: [
          {
            target: 'checkingSafeOwnership',
            guard: 'isWalletAlreadyConnected',
          },
          {
            target: 'selectingSafeOwnerWallet',
            actions: 'enableSafeMode',
          },
        ],
      },
      selectingSafeOwnerWallet: {
        entry: () => debugWallet('State: selectingSafeOwnerWallet (need EOA)'),
        on: {
          SELECT_WALLET: {
            target: 'connectingWallet',
            actions: 'setSelectedWallet',
          },
          BACK: 'enteringSafeAddress',
          CLOSE: 'closed',
        },
      },
      connectingWallet: {
        entry: () => debugWallet('State: connectingWallet (waiting for wagmi)'),
        after: {
          30000: {
            target: 'selectingWallet',
            actions: 'setTimeoutError',
          },
        },
        on: {
          WALLET_CONNECTED: {
            target: 'walletConnected',
            actions: 'setConnectedWallet',
          },
          ERROR: {
            target: 'selectingWallet',
            actions: 'setConnectionError',
          },
          CLOSE: 'closed',
        },
      },
      walletConnected: {
        always: [
          {
            target: 'checkingSafeOwnership',
            guard: 'hasPendingSafeInfo',
          },
          {
            target: 'awaitingSignature',
          },
        ],
      },
      checkingSafeOwnership: {
        entry: () => debugWallet('State: checkingSafeOwnership'),
        invoke: {
          src: 'validateSafeOwnership',
          input: ({ context }) => ({
            address: context.address!,
            safeInfo: context.pendingSafeInfo!,
          }),
          onDone: {
            target: 'switchingToSafe',
            actions: 'confirmSafeOwnership',
          },
          onError: {
            target: 'selectingSafeOwnerWallet',
            actions: 'setOwnershipError',
          },
        },
      },
      switchingToSafe: {
        entry: () =>
          debugWallet('State: switchingToSafe (waiting for wagmi connector switch)'),
        on: {
          WALLET_CONNECTED: {
            target: 'awaitingSignature',
            actions: ['setConnectedWallet', 'completeSafeSwitch'],
          },
          ERROR: {
            target: 'selectingWallet',
            actions: 'setSwitchError',
          },
          CLOSE: 'closed',
        },
      },
      awaitingSignature: {
        entry: () => debugWallet('State: awaitingSignature'),
        on: {
          SIGN_MESSAGE: 'signingMessage',
          CLOSE: 'disconnecting',
          CANCEL: 'disconnecting',
        },
      },
      signingMessage: {
        entry: () => debugWallet('State: signingMessage (waiting for user signature)'),
        after: {
          60000: {
            target: 'awaitingSignature',
            actions: 'setTimeoutError',
          },
        },
        on: {
          SIGNATURE_RECEIVED: {
            target: 'authenticating',
            actions: 'setSignature',
          },
          ERROR: {
            target: 'awaitingSignature',
            actions: 'setSignatureError',
          },
          CANCEL: 'awaitingSignature',
          CLOSE: 'disconnecting',
        },
      },
      authenticating: {
        entry: () => debugWallet('State: authenticating'),
        after: {
          10000: {
            target: 'awaitingSignature',
            actions: 'setTimeoutError',
          },
        },
        invoke: {
          src: 'verifySiweSignature',
          input: ({ context }) => ({
            message: context.message!,
            signature: context.signature!,
            safeAddress: context.safeInfo?.safeAddress,
            safeChainId: context.safeInfo?.chainId,
          }),
          onDone: {
            target: 'authenticated',
          },
          onError: {
            target: 'awaitingSignature',
            actions: 'setVerificationError',
          },
        },
      },
      authenticated: {
        entry: ['notifyAuthComplete', () => debugWallet('State: authenticated')],
        after: {
          [MODAL_CLOSE_DELAY_MS]: 'closed',
        },
      },
      disconnecting: {
        entry: () => debugWallet('State: disconnecting'),
        invoke: {
          src: 'disconnectWallet',
          onDone: 'closed',
          onError: 'closed',
        },
      },
    },
  },
  {
    guards: {
      isWalletAlreadyConnected: ({ context }) => {
        // Check if wallet is already connected (has address and connector)
        return !!(context.address && context.connector)
      },
      hasPendingSafeInfo: ({ context }) => context.pendingSafeInfo !== null,
    },
    actions: {
      setWallets: assign({
        wallets: ({ event }) => {
          if (event.type === 'OPEN') {
            return event.wallets
          }
          return []
        },
      }),
      setSelectedWallet: assign({
        selectedWalletId: ({ event }) => {
          if (event.type === 'SELECT_WALLET') {
            return event.walletId
          }
          return null
        },
      }),
      setPendingSafeAddress: assign({
        pendingSafeAddress: ({ event }) => {
          if (event.type === 'SUBMIT_SAFE_ADDRESS') {
            return event.address
          }
          return null
        },
        pendingSafeChainId: ({ event }) => {
          if (event.type === 'SUBMIT_SAFE_ADDRESS') {
            return event.chainId
          }
          return null
        },
      }),
      setPendingSafeInfo: assign({
        pendingSafeInfo: ({ event }) => {
          if (event.type === 'SAFE_VALIDATED') {
            debugWallet('Safe validated: %O', event.safeInfo)
            return event.safeInfo
          }
          return null
        },
      }),
      enableSafeMode: assign({
        isSafeMode: true,
      }),
      setConnectedWallet: assign({
        address: ({ event }) => {
          if (event.type === 'WALLET_CONNECTED') {
            return event.address
          }
          return null
        },
        connector: ({ event }) => {
          if (event.type === 'WALLET_CONNECTED') {
            return event.connector
          }
          return null
        },
      }),
      confirmSafeOwnership: assign({
        safeInfo: ({ context }) => context.pendingSafeInfo,
      }),
      completeSafeSwitch: assign({
        pendingSafeInfo: null,
        isSafeMode: false,
      }),
      setSignature: assign({
        message: ({ event }) => {
          if (event.type === 'SIGNATURE_RECEIVED') {
            return event.message
          }
          return null
        },
        signature: ({ event }) => {
          if (event.type === 'SIGNATURE_RECEIVED') {
            return event.signature
          }
          return null
        },
      }),
      notifyAuthComplete: () => {
        debugWallet('Authentication complete, triggering refresh')
        window.dispatchEvent(new Event(SIWE_REFRESH_EVENT))
      },
      setValidationError: assign({
        error: ({ context }) => {
          debugWallet('Validation error occurred')
          return {
            code: 'SAFE_NOT_FOUND',
            address: context.pendingSafeAddress || ('0x0' as Address),
          }
        },
      }),
      setConnectionError: assign({
        error: () => ({ code: 'WALLET_NOT_CONNECTED' }),
      }),
      setOwnershipError: assign({
        error: ({ context }) => ({
          code: 'NOT_SAFE_OWNER',
          address: context.address!,
          safeAddress: context.pendingSafeInfo!.safeAddress,
        }),
      }),
      setSwitchError: assign({
        error: () => ({
          code: 'NETWORK_ERROR',
          message: 'Failed to switch to Safe connector',
        }),
      }),
      setSignatureError: assign({
        error: ({ event }) => {
          if (event.type !== 'ERROR') {
            return { code: 'SIGNATURE_REJECTED', message: 'Unknown error' }
          }
          const err = event.error
          const message =
            ('message' in err ? err.message : null) ||
            ('reason' in err ? err.reason : null) ||
            'Unknown error'
          if (
            typeof message === 'string' &&
            (message.includes('User rejected') || message.includes('rejected'))
          ) {
            return { code: 'SIGNATURE_REJECTED', message: 'User rejected signature' }
          }
          return { code: 'SIGNATURE_REJECTED', message: String(message) }
        },
      }),
      setVerificationError: assign({
        error: () => ({
          code: 'VERIFICATION_FAILED',
          message: 'Signature verification failed',
        }),
      }),
      setTimeoutError: assign({
        error: () => {
          debugWallet('Operation timed out')
          return {
            code: 'NETWORK_ERROR',
            message: 'Operation timed out. Please try again.',
          }
        },
      }),
    },
    actors: {
      validateSafeAddress: fromPromise<SafeInfo, { address: Address; chainId: number }>(
        async ({ input }) => {
          const safeInfo = await getSafeInfoFromChain(input.address, input.chainId)
          if (!safeInfo) {
            throw new Error('Safe not found')
          }
          return safeInfo
        }
      ),
      connectWallet: fromPromise<
        { address: Address; connector: Connector },
        { walletId: string; wallets: WalletInfo[] }
      >(async ({ input }) => {
        const wallet = input.wallets.find((w) => w.id === input.walletId)
        if (!wallet?.connector) {
          throw new Error('Wallet connector not found')
        }
        // This will be handled by wagmi hooks in component
        throw new Error('Should be handled by component')
      }),
      validateSafeOwnership: fromPromise<void, { address: Address; safeInfo: SafeInfo }>(
        async ({ input }) => {
          const isOwner = input.safeInfo.owners.some(
            (owner) => owner.toLowerCase() === input.address.toLowerCase()
          )
          if (!isOwner) {
            throw new Error('Not a Safe owner')
          }
        }
      ),
      switchToSafeConnector: fromPromise<
        void,
        { safeInfo: SafeInfo; eoaConnectorId: string }
      >(async ({ input }) => {
        // Save Safe info to localStorage
        saveSafeInfo(input.safeInfo, input.eoaConnectorId)
        // Actual connector switch handled by component
      }),
      signSiweMessage: fromPromise<
        { message: string; signature: string },
        { address: Address; safeAddress?: Address; safeChainId?: number }
      >(async () => {
        // NOTE: This actor is not invoked - signing is handled in component via handleSign()
        // Kept for potential future use if we move signing logic to state machine
        throw new Error('Should be handled by component')
      }),
      verifySiweSignature: fromPromise<
        void,
        {
          message: string
          signature: string
          safeAddress?: Address
          safeChainId?: number
        }
      >(async ({ input }) => {
        debugWallet('verifySiweSignature called with: %O', {
          hasMessage: !!input.message,
          hasSignature: !!input.signature,
          safeAddress: input.safeAddress,
          safeChainId: input.safeChainId,
        })

        const response = await fetch(SIWE_VERIFY_PATH, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })

        debugWallet(
          'Verification response: status=%d, ok=%s',
          response.status,
          response.ok
        )

        const body = (await response.json()) as { ok?: boolean }
        debugWallet('Verification body: %O', body)

        if (!response.ok || !body.ok) {
          debugWallet('Verification failed!')
          throw new Error('Verification failed')
        }

        debugWallet('Verification succeeded, marking auth verified')
        markSiweAuthVerified()
      }),
      disconnectWallet: fromPromise(async () => {
        // Handled by component
      }),
    },
  }
)
