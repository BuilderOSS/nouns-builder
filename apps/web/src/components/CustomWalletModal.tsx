'use client'

import { useSafeDelegateAuth } from '@buildeross/hooks'
import { AnimatedModal } from '@buildeross/ui'
import { Box, Button, Stack, Text } from '@buildeross/zord'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'
import { useAccount, useSignMessage } from 'wagmi'

import { useSafeDelegateContext } from '../contexts/SafeDelegateContext'
import { useWalletConnectors } from '../hooks/useWalletConnectors'
import { addRecentWalletId } from '../utils/recentWalletIds'
import { SafeAddressModal } from './SafeAddressModal'
import { WalletOption } from './WalletOption'

interface CustomWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CustomWalletModal({ isOpen, onClose }: CustomWalletModalProps) {
  const { address, isConnected, connector: activeConnector, chainId } = useAccount()
  const [showSafeFlow, setShowSafeFlow] = useState(false)
  const [safeModeActive, setSafeModeActive] = useState(false)
  const [showSignPrompt, setShowSignPrompt] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const { state } = useSafeDelegateAuth()
  const {
    safeAddress,
    chainId: safeChainId,
    setSafeDelegateInfo,
  } = useSafeDelegateContext()
  const { signMessageAsync } = useSignMessage()

  // Get wallet connectors from our hook (similar to RainbowKit's useWalletConnectors)
  const wallets = useWalletConnectors()

  // Show sign prompt when wallet connects
  useEffect(() => {
    if (isConnected && !safeModeActive && !showSignPrompt && !isAuthenticating) {
      setShowSignPrompt(true)
    }
  }, [isConnected, safeModeActive, showSignPrompt, isAuthenticating])

  // Handle SIWE authentication when user clicks sign button
  const handleSignMessage = async () => {
    if (!address || !chainId) return

    setIsAuthenticating(true)
    setAuthError(null)

    try {
      // 1. Get nonce
      const nonceResponse = await fetch('/api/siwe/nonce')
      const nonce = await nonceResponse.text()

      // 2. Create SIWE message
      const message = createSiweMessage({
        domain: window.location.host,
        address,
        statement: safeAddress
          ? `Sign in as delegate for Safe ${safeAddress}`
          : 'Sign in with Ethereum to Nouns Builder',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      })

      // 3. Sign message
      const signature = await signMessageAsync({ message })

      // 4. Verify signature
      const verifyResponse = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
          safeAddress,
          safeChainId,
        }),
      })

      const verifyBody = await verifyResponse.json()

      if (verifyResponse.ok && verifyBody.ok) {
        // Trigger a page refresh to update auth status
        window.dispatchEvent(new Event('focus'))
        // Close modal after short delay
        setTimeout(() => {
          onClose()
          setIsAuthenticating(false)
          setShowSignPrompt(false)
        }, 300)
      } else {
        console.error('[CustomWalletModal] Verification failed:', verifyBody)
        setAuthError(verifyBody.message || 'Verification failed')
        setIsAuthenticating(false)
        setShowSignPrompt(true) // Show sign prompt again for retry
      }
    } catch (error) {
      console.error('[CustomWalletModal] Authentication error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to sign message'

      // Check if user rejected the signature
      if (errorMessage.includes('User rejected') || errorMessage.includes('rejected')) {
        setAuthError('Signature rejected. Please try again.')
      } else {
        setAuthError(errorMessage)
      }

      setIsAuthenticating(false)
      setShowSignPrompt(true) // Show sign prompt again for retry
    }
  }

  const handleWalletConnect = async (wallet: any) => {
    // Add to recent wallets
    addRecentWalletId(wallet.id)

    // Connect the wallet using the wallet's connect function
    try {
      await wallet.connect()
    } catch (error) {
      console.error('[CustomWalletModal] Connection error:', error)
      // Don't throw - allow user to retry
    }
  }

  const handleSafeDelegateClick = () => {
    setShowSafeFlow(true)
  }

  const handleSafeSubmit = async (safeAddress: Address, chainId: number) => {
    // Always save the Safe info first
    setSafeDelegateInfo(safeAddress, chainId)

    // If not connected, we need to connect first
    if (!isConnected) {
      setSafeModeActive(true)
      setShowSafeFlow(false)
      // Wait for wallet connection before validating
      return
    }

    // If already connected, close modal and let auth adapter handle validation
    setShowSafeFlow(false)
    onClose()
  }

  const handleSafeCancel = () => {
    setShowSafeFlow(false)
    setSafeModeActive(false)
  }

  // Create consolidated wallet list: Installed first, then Popular, then Safe Delegate
  const installedWallets = wallets.filter((wallet) => !wallet.isRainbowKitConnector)
  const popularWallets = wallets.filter((wallet) => wallet.isRainbowKitConnector)

  // Add Safe Delegate as a pseudo-wallet at the end
  const safeWalletOption = {
    id: 'safe-delegate',
    name: 'Safe Delegate',
    iconUrl: '/icons/wallets/safe.svg',
    iconBackground: '#12ff80',
    recent: false,
    isSafeDelegate: true,
  }

  const allWalletOptions = [...installedWallets, ...popularWallets, safeWalletOption]

  if (showSafeFlow) {
    return (
      <AnimatedModal open={isOpen} close={handleSafeCancel} size="small">
        <SafeAddressModal
          onSubmit={handleSafeSubmit}
          onCancel={handleSafeCancel}
          isValidating={state.isValidating}
          error={state.error}
          initialSafeAddress={state.safeAddress || undefined}
          initialChainId={state.chainId || undefined}
        />
      </AnimatedModal>
    )
  }

  // Show sign prompt (wallet connected, waiting for user to click sign)
  if (showSignPrompt && !isAuthenticating) {
    return (
      <AnimatedModal open={isOpen} close={onClose} size="small">
        <Box p="x5" style={{ width: '90vw', maxWidth: '380px' }}>
          <Stack gap="x5">
            <Stack gap="x2">
              <Text variant="heading-sm">Sign Message</Text>
              <Text variant="paragraph-sm" color="text3">
                To complete authentication, you need to sign a message with your wallet.
                {safeAddress && (
                  <>
                    {' '}
                    You will be signing in as a delegate for Safe{' '}
                    <Text as="span" color="text1" style={{ fontWeight: 600 }}>
                      {safeAddress.slice(0, 6)}...{safeAddress.slice(-4)}
                    </Text>
                    .
                  </>
                )}
              </Text>
              <Text variant="label-sm" color="text3" style={{ opacity: 0.7 }}>
                This request will not trigger a blockchain transaction or cost any gas
                fees.
              </Text>
            </Stack>
            {authError && (
              <Box
                p="x3"
                borderRadius="curved"
                backgroundColor="negative"
                style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
              >
                <Text variant="paragraph-sm" color="negative">
                  {authError}
                </Text>
              </Box>
            )}
            <Stack gap="x2">
              <Button onClick={handleSignMessage} w="100%" variant="primary">
                Sign Message
              </Button>
              <Button
                onClick={() => {
                  setShowSignPrompt(false)
                  setAuthError(null)
                }}
                variant="ghost"
                w="100%"
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Box>
      </AnimatedModal>
    )
  }

  // Show authenticating state (after user clicks sign button)
  if (isAuthenticating) {
    return (
      <AnimatedModal open={isOpen} close={onClose} size="small">
        <Box p="x5" style={{ width: '90vw', maxWidth: '380px' }}>
          <Stack gap="x5" align="center">
            <Stack gap="x2" align="center">
              <Text variant="heading-sm">Sign Message</Text>
              <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
                Please check your wallet and approve the signature request.
              </Text>
            </Stack>
            <Box
              p="x4"
              borderRadius="curved"
              backgroundColor="background2"
              w="100%"
              style={{ textAlign: 'center' }}
            >
              <Text variant="label-md" color="text3" style={{ opacity: 0.7 }}>
                Waiting for signature...
              </Text>
            </Box>
          </Stack>
        </Box>
      </AnimatedModal>
    )
  }

  return (
    <AnimatedModal open={isOpen} close={onClose} size="small">
      <Box p="x5" style={{ width: '90vw', maxWidth: '380px' }}>
        <Stack gap="x4">
          <Stack gap="x1">
            <Text variant="label-lg">Connect Wallet</Text>
            <Text variant="label-sm" color="text3">
              Choose how you want to connect
            </Text>
          </Stack>

          <Stack gap="x1">
            {allWalletOptions.map((wallet) => {
              const isActive = activeConnector?.id === wallet.id
              const isSafeDelegate = 'isSafeDelegate' in wallet && wallet.isSafeDelegate

              return (
                <WalletOption
                  key={wallet.id}
                  name={wallet.name}
                  icon={wallet.iconUrl}
                  iconBackground={wallet.iconBackground}
                  onClick={() =>
                    isSafeDelegate
                      ? handleSafeDelegateClick()
                      : handleWalletConnect(wallet)
                  }
                  recent={wallet.recent}
                  disabled={isActive}
                />
              )
            })}
          </Stack>

          <Text
            variant="label-xs"
            color="text3"
            style={{ textAlign: 'center', lineHeight: 1.5, opacity: 0.8 }}
          >
            By connecting a wallet, you acknowledge and agree to the Nouns Builder{' '}
            <Text
              as="a"
              href="/legal"
              target="_blank"
              rel="noopener noreferrer"
              color="accent"
              style={{ textDecoration: 'underline' }}
            >
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text
              as="a"
              href="https://support.zora.co/en/articles/6383373-zora-privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              color="accent"
              style={{ textDecoration: 'underline' }}
            >
              Privacy Policy
            </Text>
            .
          </Text>
        </Stack>
      </Box>
    </AnimatedModal>
  )
}
