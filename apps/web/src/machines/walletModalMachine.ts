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

// Server-side verification can do an EIP-1271/6492 RPC call (smart wallets)
// plus a Safe Transaction Service lookup (Safe mode), so allow well over the
// typical latency. The request is aborted if this elapses.
export const VERIFY_TIMEOUT_MS = 30000

// How long to wait for the user to sign in their wallet. Mobile wallets over
// WalletConnect often need an app switch, so keep this well above a minute;
// the user can still cancel at any time.
export const SIGNATURE_TIMEOUT_MS = 3 * 60 * 1000

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
        entry: 'resetContext',
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
          WALLET_CONNECTED: {
            target: 'walletConnected',
            actions: 'setConnectedWallet',
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
          WALLET_CONNECTED: {
            target: 'walletConnected',
            actions: 'setConnectedWallet',
          },
          RETRY: {
            actions: 'clearError',
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
        invoke: {
          src: 'switchToSafeConnector',
          input: ({ context }) => ({
            safeInfo: context.safeInfo!,
            ownerConnectorId: context.connector!.id,
            ownerAddress: context.address!, // Pass the confirmed owner address
          }),
        },
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
          CANCEL: { target: 'selectingWallet', actions: 'resetAttemptContext' },
        },
      },
      signingMessage: {
        entry: () => debugWallet('State: signingMessage (waiting for user signature)'),
        after: {
          [SIGNATURE_TIMEOUT_MS]: {
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
          CANCEL: { target: 'selectingWallet', actions: 'resetAttemptContext' },
          CLOSE: { target: 'closed', actions: 'resetAttemptContext' },
        },
      },
      authenticating: {
        entry: () => debugWallet('State: authenticating'),
        // Leaving this state stops the invoked actor, which aborts the verify
        // request so a late response can't set the session cookie behind the
        // UI's back (or clobber the nonce of a retry). The refresh covers the
        // narrow window where the cookie landed just before the abort.
        after: {
          [VERIFY_TIMEOUT_MS]: {
            target: 'awaitingSignature',
            actions: ['setTimeoutError', 'refreshSession'],
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
        on: {
          CLOSE: { target: 'closed', actions: ['resetAttemptContext', 'refreshSession'] },
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
      resetContext: assign({
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
      }),
      resetAttemptContext: assign({
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
      refreshSession: () => {
        debugWallet('Verification abandoned, re-checking session')
        window.dispatchEvent(new Event(SIWE_REFRESH_EVENT))
      },
      setValidationError: assign({
        error: ({ context, event }) => {
          debugWallet('Validation error occurred')
          // Keep the component's error (e.g. Safe service unavailable) rather
          // than reporting every failure as "Safe not found".
          if (event.type === 'ERROR') return event.error
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
      clearError: assign({
        error: null,
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
        error: ({ event }) => ({
          code: 'VERIFICATION_FAILED',
          message:
            'error' in event && event.error instanceof Error
              ? event.error.message
              : 'Signature verification failed',
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
          const normalizedAddress = input.address.toLowerCase()
          const normalizedOwners = input.safeInfo.owners.map((owner) =>
            owner.toLowerCase()
          )
          const isOwner = normalizedOwners.includes(normalizedAddress)

          if (!isOwner) {
            throw new Error('Not a Safe owner')
          }
        }
      ),
      switchToSafeConnector: fromPromise<
        void,
        { safeInfo: SafeInfo; ownerConnectorId: string; ownerAddress: Address }
      >(async ({ input }) => {
        // Save Safe info with owner address before the Safe connector switch begins.
        // This allows SafeOwnerConnector to retrieve the address without wagmi state access issues
        saveSafeInfo(input.safeInfo, input.ownerConnectorId, input.ownerAddress)
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
      >(async ({ input, signal }) => {
        debugWallet('verifySiweSignature called with: %O', {
          hasMessage: !!input.message,
          hasSignature: !!input.signature,
          safeAddress: input.safeAddress,
          safeChainId: input.safeChainId,
        })

        const response = await fetch(SIWE_VERIFY_PATH, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
          signal,
        })

        debugWallet(
          'Verification response: status=%d, ok=%s',
          response.status,
          response.ok
        )

        // verify.ts answers 422 when the session nonce is missing or doesn't
        // match: cookies blocked, or a newer sign-in attempt (e.g. another tab)
        // replaced the nonce.
        if (response.status === 422) {
          throw new Error(
            'Your sign-in request expired. Please try again, and make sure cookies are enabled for this site.'
          )
        }

        if (!response.ok) {
          // Prefer the server's explanation (e.g. Safe service unavailable,
          // not a Safe owner, request made for another site).
          const serverMessage = await response
            .json()
            .then((data: { message?: unknown }) =>
              typeof data?.message === 'string' ? data.message : null
            )
            .catch(() => null)
          throw new Error(
            serverMessage ??
              `Signature verification failed with status ${response.status}. Please try again.`
          )
        }

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
