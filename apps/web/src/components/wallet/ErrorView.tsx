'use client'

import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'

import type { AuthError } from '../../types/auth'

interface ErrorViewProps {
  error: AuthError
  onRetry?: () => void
  onBack?: () => void
  onClose: () => void
}

function getErrorMessage(error: AuthError): { title: string; message: string } {
  switch (error.code) {
    case 'WALLET_NOT_CONNECTED':
      return {
        title: 'Connection Failed',
        message: 'Failed to connect to your wallet. Please try again.',
      }
    case 'SIGNATURE_REJECTED':
      return {
        title: 'Signature Rejected',
        message: error.message || 'You rejected the signature request.',
      }
    case 'SAFE_NOT_FOUND':
      return {
        title: 'Safe Not Found',
        message:
          error.message ||
          `The Safe at ${error.address.slice(0, 6)}...${error.address.slice(-4)} could not be found on this network.`,
      }
    case 'NOT_SAFE_OWNER':
      return {
        title: 'Not a Safe Owner',
        message:
          error.message ||
          `Address ${error.address.slice(0, 6)}...${error.address.slice(-4)} is not an owner of Safe ${error.safeAddress.slice(0, 6)}...${error.safeAddress.slice(-4)}.`,
      }
    case 'VERIFICATION_FAILED':
      return {
        title: 'Verification Failed',
        message: error.message || 'Failed to verify your signature.',
      }
    case 'NETWORK_ERROR':
      return {
        title: 'Network Error',
        message: error.message || 'A network error occurred. Please try again.',
      }
    default:
      return {
        title: 'Error',
        message: 'An unexpected error occurred.',
      }
  }
}

export function ErrorView({ error, onRetry, onBack, onClose }: ErrorViewProps) {
  const { title, message } = getErrorMessage(error)

  return (
    <Stack gap="x4" p="x5">
      <Text variant="heading-sm">{title}</Text>

      <Box p="x3" borderRadius="phat" backgroundColor="background2">
        <Text variant="paragraph-sm" color="negative">
          {message}
        </Text>
      </Box>

      <Flex gap="x3">
        {onRetry && (
          <Button onClick={onRetry} style={{ flex: 1 }}>
            Try Again
          </Button>
        )}
        {onBack && (
          <Button onClick={onBack} variant="secondary" style={{ flex: 1 }}>
            Go Back
          </Button>
        )}
        <Button onClick={onClose} variant="secondary" style={{ flex: 1 }}>
          Close
        </Button>
      </Flex>
    </Stack>
  )
}
