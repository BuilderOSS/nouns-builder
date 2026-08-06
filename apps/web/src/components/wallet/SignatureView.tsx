'use client'

import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import type { Address } from 'viem'

interface SignatureViewProps {
  address: Address
  walletName: string
  mode: 'eoa' | 'safe'
  safeAddress?: Address
  onSign: () => void
  onCancel: () => void
  error?: string
  isAuthenticating?: boolean
}

export function SignatureView({
  address,
  walletName,
  mode,
  safeAddress,
  onSign,
  onCancel,
  error,
  isAuthenticating,
}: SignatureViewProps) {
  return (
    <Stack gap="x4" p="x5">
      <Text variant="heading-sm">Sign Message</Text>

      <Stack gap="x3">
        <Box>
          <Text variant="paragraph-sm" color="text3">
            Wallet
          </Text>
          <Text variant="paragraph-sm">{walletName}</Text>
        </Box>

        <Box>
          <Text variant="paragraph-sm" color="text3">
            {mode === 'safe' ? 'Signing as owner' : 'Address'}
          </Text>
          <Text variant="paragraph-sm" style={{ fontFamily: 'monospace' }}>
            {address.slice(0, 6)}...{address.slice(-4)}
          </Text>
        </Box>

        {mode === 'safe' && safeAddress && (
          <Box>
            <Text variant="paragraph-sm" color="text3">
              Safe address
            </Text>
            <Text variant="paragraph-sm" style={{ fontFamily: 'monospace' }}>
              {safeAddress.slice(0, 6)}...{safeAddress.slice(-4)}
            </Text>
          </Box>
        )}
      </Stack>

      <Box>
        <Text variant="paragraph-sm" color="text3">
          Confirm the message in {walletName} to continue
        </Text>
      </Box>

      {error && (
        <Box p="x3" borderRadius="phat" backgroundColor="background2">
          <Text variant="paragraph-sm" color="negative">
            {error}
          </Text>
        </Box>
      )}

      <Flex gap="x3">
        <Button onClick={onSign} disabled={isAuthenticating} style={{ flex: 1 }}>
          {isAuthenticating ? 'Signing...' : 'Sign Message'}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isAuthenticating}
          variant="secondary"
          style={{ flex: 1 }}
        >
          Cancel
        </Button>
      </Flex>
    </Stack>
  )
}
