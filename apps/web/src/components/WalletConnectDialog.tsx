'use client'

import { AnimatedModal } from '@buildeross/ui'
import { getSafeInfo, setSafeInfo } from '@buildeross/utils'
import { getConnectors } from '@wagmi/core'
import { useMachine } from '@xstate/react'
import { useEffect, useMemo, useRef } from 'react'
import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'
import { useAccount, useConfig, useConnect, useSignMessage } from 'wagmi'

import { useWalletConnectors } from '../hooks/useWalletConnectors'
import { walletModalMachine } from '../machines/walletModalMachine'
import type { WalletInfo } from '../types/auth'
import { debugWallet } from '../utils/debug'
import { beginSiweAuthFlow, SIWE_NONCE_PATH } from '../utils/siweAuthFlow'
import { ErrorView } from './wallet/ErrorView'
import { LoadingView } from './wallet/LoadingView'
import { SafeAddressView } from './wallet/SafeAddressView'
import { SignatureView } from './wallet/SignatureView'
import { WalletListView } from './wallet/WalletListView'

interface WalletConnectDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function WalletConnectDialog({ isOpen, onClose }: WalletConnectDialogProps) {
  const [state, send] = useMachine(walletModalMachine)
  const { address, connector: activeConnector, isConnected, chainId } = useAccount()
  const { connectAsync } = useConnect()
  const { signMessageAsync } = useSignMessage()
  const wagmiConfig = useConfig()

  // Track if we just authenticated to prevent immediate reopening
  const justAuthenticatedRef = useRef(false)

  // Use proper wallet connector hook (handles deduplication)
  const walletConnectors = useWalletConnectors()

  // Transform to WalletInfo format (memoized to prevent infinite re-renders)
  const wallets: WalletInfo[] = useMemo(
    () =>
      walletConnectors.map((wc) => ({
        id: wc.id,
        name: wc.name,
        iconUrl: wc.iconUrl,
        isRainbowKitConnector: wc.isRainbowKitConnector,
        connector: wc.connector,
      })),
    [walletConnectors]
  )

  // Open modal handler
  useEffect(() => {
    if (isOpen && state.matches('closed') && !justAuthenticatedRef.current) {
      send({ type: 'OPEN', wallets })
    }
    // Only react to isOpen and state changes, not wallets
    // Wallets are captured in the closure when needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, state, send])

  // Close modal handler
  useEffect(() => {
    if (!isOpen && !state.matches('closed')) {
      send({ type: 'CLOSE' })
    }
  }, [isOpen, state, send])

  // Handle wallet connection when wagmi connects
  useEffect(() => {
    const isWaitingForConnection =
      state.matches('connectingWallet') || state.matches('switchingToSafe')

    if (isWaitingForConnection && isConnected && address && activeConnector) {
      debugWallet('Wallet connected: %s via %s', address, activeConnector.name)
      send({
        type: 'WALLET_CONNECTED',
        address,
        connector: activeConnector,
      })
    }
  }, [state, isConnected, address, activeConnector, send])

  // Handle Safe address validation
  useEffect(() => {
    if (state.matches('validatingSafe') && state.context.pendingSafeAddress) {
      const abortController = new AbortController()

      const validate = async () => {
        try {
          debugWallet(
            'Validating Safe: %s on chain %d',
            state.context.pendingSafeAddress,
            state.context.pendingSafeChainId
          )

          // Check abort before async operation
          if (abortController.signal.aborted) {
            debugWallet('Validation aborted before starting')
            return
          }

          const safeInfo = await getSafeInfo(
            state.context.pendingSafeAddress!,
            state.context.pendingSafeChainId!
          )

          // Check if component is still mounted after async operation
          if (abortController.signal.aborted) {
            debugWallet('Validation aborted after fetch')
            return
          }

          if (safeInfo) {
            debugWallet('Safe validated: %O', safeInfo)
            send({ type: 'SAFE_VALIDATED', safeInfo })
          } else {
            debugWallet('Safe not found')
            send({
              type: 'ERROR',
              error: {
                code: 'SAFE_NOT_FOUND',
                address: state.context.pendingSafeAddress!,
              },
            })
          }
        } catch (error) {
          // Check if component is still mounted
          if (abortController.signal.aborted) {
            debugWallet('Validation aborted in error handler')
            return
          }

          debugWallet('Safe validation error: %O', error)
          send({
            type: 'ERROR',
            error: { code: 'SAFE_NOT_FOUND', address: state.context.pendingSafeAddress! },
          })
        }
      }
      validate()

      return () => {
        abortController.abort()
      }
    }
  }, [state, send])

  // Handle Safe connector switch
  useEffect(() => {
    if (
      state.matches('switchingToSafe') &&
      state.context.safeInfo &&
      state.context.connector
    ) {
      const abortController = new AbortController()

      const switchConnector = async () => {
        try {
          debugWallet('Switching to Safe connector...')

          // Check abort before starting
          if (abortController.signal.aborted) {
            debugWallet('Safe connector switch aborted before start')
            return
          }

          // Store Safe info with EOA connector ID for persistence
          setSafeInfo(state.context.safeInfo!, state.context.connector!.id)

          // Find SafeOwnerConnector from wagmi config
          const safeConnector = getConnectors(wagmiConfig).find(
            (c) => c.id === 'safeOwner'
          )

          if (!safeConnector) {
            throw new Error('SafeOwnerConnector not found in wagmi config')
          }

          // Check abort before async operation
          if (abortController.signal.aborted) {
            debugWallet('Safe connector switch aborted before connect')
            return
          }

          debugWallet('Connecting to SafeOwnerConnector...')
          await connectAsync({ connector: safeConnector })

          // Check abort immediately after async operation (before state updates)
          if (abortController.signal.aborted) {
            debugWallet(
              'Safe connector switch aborted after connect (component unmounted)'
            )
            return
          }

          debugWallet('Safe connector switch complete')

          // The existing useEffect will detect the new connection and send WALLET_CONNECTED
        } catch (error) {
          // Check abort in catch block (before state updates)
          if (abortController.signal.aborted) {
            debugWallet('Safe connector switch aborted in error handler')
            return
          }

          debugWallet('Safe connector switch error: %O', error)
          send({
            type: 'ERROR',
            error: {
              code: 'NETWORK_ERROR',
              message: 'Failed to switch to Safe connector',
            },
          })
        }
      }
      switchConnector()

      return () => {
        abortController.abort()
      }
    }
  }, [state, send, wagmiConfig, connectAsync])

  // Debug state changes
  useEffect(() => {
    debugWallet('State changed: %s', state.value)
    if (state.context.error) {
      debugWallet('State has error: %O', state.context.error)
    }

    // Log when authenticated
    if (state.matches('authenticated')) {
      debugWallet('AUTHENTICATED STATE REACHED! Modal should close in 500ms')
    }

    // Log if we go back to selecting wallet (shouldn't happen after auth)
    if (state.matches('selectingWallet') && state.context.address) {
      debugWallet(
        'WARNING: Back to selectingWallet but have address: %s',
        state.context.address
      )
    }
  }, [state])

  // Handle modal close after authentication
  useEffect(() => {
    // Only close if we just authenticated (came from authenticated state)
    if (state.matches('authenticated')) {
      debugWallet('Authenticated! Scheduling modal close...')
      justAuthenticatedRef.current = true

      // Wait for state machine to transition to closed, then notify parent
      const timer = setTimeout(() => {
        debugWallet('Closing modal after authentication')
        onClose()
      }, 600) // Slightly longer than state machine's 500ms delay

      return () => {
        clearTimeout(timer)
        // Reset flag if component unmounts before timer fires
        if (justAuthenticatedRef.current) {
          debugWallet('Component unmounting with authentication pending, resetting flag')
          justAuthenticatedRef.current = false
        }
      }
    }
  }, [state, onClose])

  // Clear the authentication flag when session becomes authenticated or modal closes
  useEffect(() => {
    if (state.matches('closed') && !isOpen) {
      // Reset flag after a delay to allow session to update
      const timer = setTimeout(() => {
        debugWallet('Clearing justAuthenticated flag')
        justAuthenticatedRef.current = false
      }, 2000) // Wait 2 seconds for session to fully update
      return () => clearTimeout(timer)
    }
  }, [state, isOpen])

  // Handle wallet selection
  const handleSelectWallet = async (walletId: string) => {
    debugWallet('handleSelectWallet called with walletId: %s', walletId)
    debugWallet(
      'Available wallets: %O',
      wallets.map((w) => ({ id: w.id, name: w.name, hasConnector: !!w.connector }))
    )

    const wallet = wallets.find((w) => w.id === walletId)

    if (!wallet) {
      debugWallet('ERROR: Wallet not found in list! walletId: %s', walletId)
      send({ type: 'ERROR', error: { code: 'WALLET_NOT_CONNECTED' } })
      return
    }

    if (!wallet.connector) {
      debugWallet('ERROR: Wallet connector is null/undefined! wallet: %O', wallet)
      send({ type: 'ERROR', error: { code: 'WALLET_NOT_CONNECTED' } })
      return
    }

    send({ type: 'SELECT_WALLET', walletId })

    try {
      debugWallet(
        'Connecting to %s (id: %s, connector: %O)...',
        wallet.name,
        wallet.id,
        wallet.connector
      )
      const result = await connectAsync({ connector: wallet.connector })
      debugWallet('Connected successfully: %O', result)
    } catch (error) {
      debugWallet('Connection error: %O', error)
      send({ type: 'ERROR', error: { code: 'WALLET_NOT_CONNECTED' } })
    }
  }

  // Handle Safe address submission
  const handleSubmitSafeAddress = (safeAddress: Address, chainId: number) => {
    send({
      type: 'SUBMIT_SAFE_ADDRESS',
      address: safeAddress,
      chainId,
    })
  }

  // Handle signature request
  const handleSign = async () => {
    debugWallet('handleSign called, current state: %s', state.value)
    debugWallet(
      'State context: address=%s, safeInfo=%O',
      state.context.address,
      state.context.safeInfo
    )

    send({ type: 'SIGN_MESSAGE' })

    // Create AbortController with 60s timeout for signature request
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      abortController.abort()
      debugWallet('Signature request timed out after 60s')
    }, 60000)

    try {
      const currentAddress = state.context.address
      const safeAddress = state.context.safeInfo?.safeAddress
      const safeChainId = state.context.safeInfo?.chainId

      if (!currentAddress) {
        debugWallet('ERROR: No address in state context!')
        throw new Error('No address available')
      }

      // Begin auth flow
      beginSiweAuthFlow()

      // Get nonce from API
      debugWallet('Fetching nonce from /api/siwe/nonce...')
      const nonceRes = await fetch(SIWE_NONCE_PATH)
      debugWallet('Nonce response status: %d', nonceRes.status)

      // Get response as text first to see what we're receiving
      const nonceText = await nonceRes.text()
      debugWallet('Nonce response text: %s', nonceText)

      // Parse the nonce - the endpoint might return plain text instead of JSON
      let nonce: string
      try {
        const parsed = JSON.parse(nonceText)
        nonce = parsed.nonce || parsed
      } catch {
        // If it's not JSON, use the text directly as the nonce
        nonce = nonceText
      }

      // Validate nonce format and length (SIWE spec requires minimum 8 characters)
      if (!nonce || typeof nonce !== 'string' || nonce.trim().length < 8) {
        debugWallet('Invalid nonce received: %s', nonce)
        throw new Error('Invalid nonce received from server')
      }

      debugWallet('Nonce received and validated: %s', nonce)

      // Use Safe chainId if available, otherwise use wagmi chainId, default to 1
      const currentChainId = safeChainId || chainId || 1
      debugWallet(
        'Using chainId: %d (Safe: %d, wagmi: %d)',
        currentChainId,
        safeChainId,
        chainId
      )

      // Create SIWE message
      const message = createSiweMessage({
        domain: window.location.host,
        address: currentAddress,
        statement: safeAddress
          ? `Sign in as owner of Safe ${safeAddress}`
          : 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: currentChainId,
        nonce,
      })

      debugWallet('SIWE message created: %s', message)
      debugWallet('Requesting signature from wallet...')

      // Sign message
      const signature = await signMessageAsync({ message })

      // Clear timeout on success
      clearTimeout(timeoutId)

      // Check if aborted (timed out)
      if (abortController.signal.aborted) {
        debugWallet('Signature request was aborted (timeout)')
        send({
          type: 'ERROR',
          error: {
            code: 'SIGNATURE_REJECTED',
            message: 'Signature request timed out',
          },
        })
        return
      }

      debugWallet('Signature received successfully: %s', signature)

      send({
        type: 'SIGNATURE_RECEIVED',
        signature,
        message,
      })

      debugWallet('SIGNATURE_RECEIVED event sent to state machine')
    } catch (error) {
      // Clear timeout on error
      clearTimeout(timeoutId)

      // Check if aborted (timed out)
      if (abortController.signal.aborted) {
        debugWallet('Signature request was aborted (timeout)')
        send({
          type: 'ERROR',
          error: {
            code: 'SIGNATURE_REJECTED',
            message: 'Signature request timed out',
          },
        })
        return
      }

      debugWallet('Signature error: %O', error)
      debugWallet(
        'Error name: %s, message: %s',
        (error as Error).name,
        (error as Error).message
      )
      send({
        type: 'ERROR',
        error: {
          code: 'SIGNATURE_REJECTED',
          message: (error as Error).message || 'Unknown error',
        },
      })
    }
  }

  // Handle cancel
  const handleCancel = () => {
    send({ type: 'CANCEL' })
  }

  // Handle back navigation
  const handleBack = () => {
    send({ type: 'BACK' })
  }

  // Handle retry
  const handleRetry = () => {
    send({ type: 'RETRY' })
  }

  // Handle close
  const handleClose = () => {
    if (!state.matches('closed')) {
      send({ type: 'CLOSE' })
    }
    onClose()
  }

  // Render appropriate view based on state
  const renderContent = () => {
    if (state.matches('selectingWallet')) {
      return (
        <WalletListView
          wallets={wallets}
          onSelectWallet={handleSelectWallet}
          onSelectSafe={() => send({ type: 'SELECT_SAFE' })}
          showSafeOption={true}
        />
      )
    }

    if (state.matches('enteringSafeAddress')) {
      return (
        <SafeAddressView
          onSubmit={handleSubmitSafeAddress}
          onBack={handleBack}
          error={
            state.context.error?.code === 'SAFE_NOT_FOUND'
              ? 'Safe not found on this network'
              : undefined
          }
        />
      )
    }

    if (state.matches('validatingSafe')) {
      return <LoadingView message="Validating Safe..." />
    }

    if (state.matches('selectingSafeOwnerWallet')) {
      return (
        <WalletListView
          wallets={wallets}
          onSelectWallet={handleSelectWallet}
          onSelectSafe={() => {}}
          showSafeOption={false}
        />
      )
    }

    if (state.matches('connectingWallet')) {
      const walletName = state.context.selectedWalletId
        ? wallets.find((w) => w.id === state.context.selectedWalletId)?.name
        : 'wallet'
      return <LoadingView message={`Connecting to ${walletName}...`} />
    }

    if (state.matches('checkingSafeOwnership')) {
      return <LoadingView message="Verifying Safe ownership..." />
    }

    if (state.matches('switchingToSafe')) {
      return <LoadingView message="Switching to Safe connector..." />
    }

    if (state.matches('awaitingSignature') || state.matches('signingMessage')) {
      const walletName =
        state.context.connector?.name ||
        wallets.find((w) => w.id === state.context.selectedWalletId)?.name ||
        'wallet'

      return (
        <SignatureView
          address={state.context.address!}
          walletName={walletName}
          mode={state.context.safeInfo ? 'safe' : 'eoa'}
          safeAddress={state.context.safeInfo?.safeAddress}
          onSign={handleSign}
          onCancel={handleCancel}
          error={
            state.context.error?.code === 'SIGNATURE_REJECTED'
              ? state.context.error.message
              : undefined
          }
          isAuthenticating={state.matches('signingMessage')}
        />
      )
    }

    if (state.matches('authenticating')) {
      return <LoadingView message="Verifying signature..." />
    }

    if (state.matches('authenticated')) {
      return <LoadingView message="Authenticated!" />
    }

    if (state.context.error) {
      return (
        <ErrorView
          error={state.context.error}
          onRetry={handleRetry}
          onBack={handleBack}
          onClose={handleClose}
        />
      )
    }

    return <LoadingView />
  }

  return (
    <AnimatedModal open={isOpen && !state.matches('closed')} close={handleClose}>
      {renderContent()}
    </AnimatedModal>
  )
}
