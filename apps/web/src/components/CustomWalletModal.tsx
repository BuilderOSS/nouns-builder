'use client'

import { CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui'
import { isOwnerOfSafe, isSafeAddress, setSafeInfo } from '@buildeross/utils'
import { Box, Button, Stack, Text } from '@buildeross/zord'
import { getConnectors } from '@wagmi/core'
import { useEffect, useState } from 'react'
import type { Address } from 'viem'
import { createSiweMessage } from 'viem/siwe'
import {
  type Connector,
  useAccount,
  useConfig,
  useConnect,
  useDisconnect,
  useSignMessage,
} from 'wagmi'

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
  const wagmiConfig = useConfig()
  const [showSafeFlow, setShowSafeFlow] = useState(false)
  const [safeModeActive, setSafeModeActive] = useState(false)
  const [showSignPrompt, setShowSignPrompt] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isValidatingSafe, setIsValidatingSafe] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [safeValidationError, setSafeValidationError] = useState<string | null>(null)
  const [pendingSafeInfo, setPendingSafeInfo] = useState<{
    safeAddress: Address
    chainId: CHAIN_ID
  } | null>(null)
  const { signMessageAsync } = useSignMessage()
  const { connectAsync } = useConnect()
  const { disconnectAsync } = useDisconnect()

  // Get wallet connectors from our hook (similar to RainbowKit's useWalletConnectors)
  const wallets = useWalletConnectors()

  // Show sign prompt when wallet connects (only for non-Safe connectors)
  useEffect(() => {
    if (
      isConnected &&
      !safeModeActive &&
      !showSignPrompt &&
      !isAuthenticating &&
      activeConnector?.id !== 'safeOwner'
    ) {
      setShowSignPrompt(true)
    }
  }, [isConnected, safeModeActive, showSignPrompt, isAuthenticating, activeConnector?.id])

  // Show sign prompt after Safe connector switch completes
  useEffect(() => {
    if (
      isConnected &&
      activeConnector?.id === 'safeOwner' &&
      !showSignPrompt &&
      !isAuthenticating
    ) {
      setShowSignPrompt(true)
    }
  }, [isConnected, activeConnector?.id, showSignPrompt, isAuthenticating])

  // Handle EOA connection in Safe mode
  useEffect(() => {
    const validateAndSwitchToSafe = async () => {
      if (
        !isConnected ||
        !safeModeActive ||
        !pendingSafeInfo ||
        !address ||
        !activeConnector
      )
        return

      setIsValidatingSafe(true)
      setSafeValidationError(null)

      try {
        // Validate that connected wallet is an owner
        const isOwner = await isOwnerOfSafe(
          address,
          pendingSafeInfo.safeAddress,
          pendingSafeInfo.chainId
        )

        if (!isOwner) {
          setSafeValidationError('Your wallet is not an owner of this Safe')
          setIsValidatingSafe(false)
          return
        }

        // Store Safe info with EOA connector ID for persistence
        setSafeInfo(
          pendingSafeInfo.safeAddress,
          pendingSafeInfo.chainId,
          activeConnector.id
        )

        // Find SafeOwnerConnector from wagmi config
        const safeConnector = getConnectors(wagmiConfig).find(
          (c: Connector) => c.id === 'safeOwner'
        )

        if (!safeConnector) {
          throw new Error('SafeOwnerConnector not found in wagmi config')
        }

        // Connect to Safe connector (don't disconnect EOA - SafeOwnerConnector needs it)
        await connectAsync({ connector: safeConnector })

        // Clear pending info
        // Note: Don't set showSignPrompt here - let the useEffect handle it
        // after wagmi state updates to safeOwner connector
        setPendingSafeInfo(null)
        setSafeModeActive(false)
        setIsValidatingSafe(false)
      } catch (error) {
        console.error('[CustomWalletModal] Failed to switch to Safe connector:', error)
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to validate Safe ownership'
        setSafeValidationError(errorMessage)
        setIsValidatingSafe(false)
      }
    }

    validateAndSwitchToSafe()
  }, [
    isConnected,
    safeModeActive,
    pendingSafeInfo,
    address,
    activeConnector,
    connectAsync,
    disconnectAsync,
    wagmiConfig,
  ])

  // Handle SIWE authentication when user clicks sign button
  const handleSignMessage = async () => {
    if (!address || !chainId) return

    setIsAuthenticating(true)
    setAuthError(null)

    try {
      // Detect if using SafeOwnerConnector
      const isSafeMode = activeConnector?.id === 'safeOwner'

      // For Safe mode, get the EOA address that will actually sign
      let signingAddress = address
      let safeAddress: Address | null = null

      if (isSafeMode && activeConnector && 'getEOAAddress' in activeConnector) {
        const eoaAddress = await (activeConnector as any).getEOAAddress()
        if (eoaAddress) {
          signingAddress = eoaAddress
          safeAddress = address // address is the Safe address
        }
      }

      // 1. Get nonce
      const nonceResponse = await fetch('/api/siwe/nonce')
      const nonce = await nonceResponse.text()

      // 2. Create SIWE message
      // Note: In Safe mode, we sign with EOA address, not Safe address
      const message = createSiweMessage({
        domain: window.location.host,
        address: signingAddress, // EOA address in Safe mode
        statement: isSafeMode
          ? `Sign in as owner for Safe ${safeAddress}`
          : 'Sign in with Ethereum to Nouns Builder',
        uri: window.location.origin,
        version: '1',
        chainId,
        nonce,
      })

      // 3. Sign message with EOA
      const signature = await signMessageAsync({ message })

      // 4. Verify signature
      const verifyResponse = await fetch('/api/siwe/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          signature,
          safeAddress: safeAddress, // Send Safe address if in Safe mode
          safeChainId: isSafeMode ? chainId : null,
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

  const handleSafeClick = () => {
    setShowSafeFlow(true)
  }

  const handleSafeSubmit = async (safeAddress: Address, safeChainId: number) => {
    setIsValidatingSafe(true)
    setSafeValidationError(null)

    try {
      // 1. Validate that the address is actually a Safe
      const isValid = await isSafeAddress(safeAddress, safeChainId as CHAIN_ID)

      if (!isValid) {
        setSafeValidationError('This address is not a Safe on the selected network')
        setIsValidatingSafe(false)
        return
      }

      // 2. If not connected, save Safe info and show wallet list
      if (!isConnected) {
        setPendingSafeInfo({ safeAddress, chainId: safeChainId as CHAIN_ID })
        setSafeModeActive(true)
        setShowSafeFlow(false)
        setIsValidatingSafe(false)
        return
      }

      // 3. Validate that connected wallet is an owner
      const isOwner = await isOwnerOfSafe(address!, safeAddress, safeChainId as CHAIN_ID)

      if (!isOwner) {
        setSafeValidationError('Your wallet is not an owner of this Safe')
        setIsValidatingSafe(false)
        return
      }

      // 4. Create SafeOwnerConnector with current EOA connector
      if (!activeConnector) {
        setSafeValidationError('No wallet connected')
        setIsValidatingSafe(false)
        return
      }

      // Store Safe info with EOA connector ID for persistence
      setSafeInfo(safeAddress, safeChainId as CHAIN_ID, activeConnector.id)

      // Find SafeOwnerConnector from wagmi config
      const safeConnector = getConnectors(wagmiConfig).find(
        (c: Connector) => c.id === 'safeOwner'
      )

      if (!safeConnector) {
        throw new Error('SafeOwnerConnector not found in wagmi config')
      }

      // Connect to Safe connector (don't disconnect EOA - SafeOwnerConnector needs it)
      await connectAsync({ connector: safeConnector })

      // 5. Close Safe flow
      // Note: Don't set showSignPrompt here - let the useEffect handle it
      // after wagmi state updates to safeOwner connector
      setShowSafeFlow(false)
      setIsValidatingSafe(false)
    } catch (error) {
      console.error('[CustomWalletModal] Safe validation error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to validate Safe ownership'
      setSafeValidationError(errorMessage)
      setIsValidatingSafe(false)
    }
  }

  const handleSafeCancel = () => {
    setShowSafeFlow(false)
    setSafeModeActive(false)
  }

  // Create consolidated wallet list: Installed first, then Popular, then Safe (unless in Safe mode)
  const installedWallets = wallets.filter((wallet) => !wallet.isRainbowKitConnector)
  const popularWallets = wallets.filter((wallet) => wallet.isRainbowKitConnector)

  // Add Safe as a pseudo-wallet at the end (hide when safeModeActive)
  const safeWalletOption = {
    id: 'safe',
    name: 'Safe',
    iconUrl: '/icons/wallets/safe.svg',
    iconBackground: '#12ff80',
    recent: false,
    isSafe: true,
  }

  const allWalletOptions = safeModeActive
    ? [...installedWallets, ...popularWallets]
    : [...installedWallets, ...popularWallets, safeWalletOption]

  if (showSafeFlow) {
    return (
      <AnimatedModal open={isOpen} close={handleSafeCancel} size="small">
        <SafeAddressModal
          onSubmit={handleSafeSubmit}
          onCancel={handleSafeCancel}
          isValidating={isValidatingSafe}
          error={safeValidationError}
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
                {activeConnector?.id === 'safeOwner' && address && (
                  <>
                    {' '}
                    You will be signing in as an owner for Safe{' '}
                    <Text as="span" color="text1" style={{ fontWeight: 600 }}>
                      {address.slice(0, 6)}...{address.slice(-4)}
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
            <Text variant="label-lg">
              {safeModeActive ? 'Connect as Safe Owner' : 'Connect Wallet'}
            </Text>
            <Text variant="label-sm" color="text3">
              {safeModeActive
                ? `Connect with a wallet that is one of the owners of this Safe`
                : 'Choose how you want to connect'}
            </Text>
          </Stack>

          {safeValidationError && safeModeActive && (
            <Stack
              p="x3"
              borderRadius="curved"
              style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
            >
              <Text variant="paragraph-sm" color="negative">
                {safeValidationError}
              </Text>
            </Stack>
          )}

          <Stack gap="x1">
            {allWalletOptions.map((wallet) => {
              const isActive = activeConnector?.id === wallet.id
              const isSafe = 'isSafe' in wallet && wallet.isSafe

              return (
                <WalletOption
                  key={wallet.id}
                  name={wallet.name}
                  icon={wallet.iconUrl}
                  iconBackground={wallet.iconBackground}
                  onClick={() =>
                    isSafe ? handleSafeClick() : handleWalletConnect(wallet)
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
