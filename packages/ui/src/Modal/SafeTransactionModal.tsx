'use client'

import { SAFE_HOME_URL } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import type { Address } from 'viem'

import { SafeToastModal } from './SafeToastModal'

interface SafeTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  safeAddress: Address
  threshold: number
  ownersCount: number
  chainId: CHAIN_ID
  onConfirm: () => Promise<{ safeTxHash: string }>
}

export function SafeTransactionModal({
  isOpen,
  onClose,
  safeAddress,
  threshold,
  ownersCount,
  chainId,
  onConfirm,
}: SafeTransactionModalProps) {
  const [state, setState] = useState<'idle' | 'proposing' | 'success' | 'error'>('idle')
  const [safeTxHash, setSafeTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setState('proposing')
    setError(null)

    try {
      const result = await onConfirm()
      setSafeTxHash(result.safeTxHash)
      setState('success')
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to propose transaction'
      setError(errorMessage)
      setState('error')
    }
  }

  const handleClose = () => {
    setState('idle')
    setSafeTxHash(null)
    setError(null)
    onClose()
  }

  const safeAppUrl =
    safeTxHash && SAFE_HOME_URL[chainId]
      ? `${SAFE_HOME_URL[chainId]}:${safeAddress}/transactions/queue?id=multisig_${safeAddress}_${safeTxHash}`
      : null

  return (
    <SafeToastModal isOpen={isOpen} onClose={handleClose}>
      <Stack gap="x4">
        {/* Idle State */}
        {state === 'idle' && (
          <>
            <Stack gap="x2">
              <Text variant="heading-sm">Propose Transaction to Safe</Text>
              <Text variant="paragraph-sm" color="text3">
                This is a multi-signature Safe wallet requiring {threshold} of{' '}
                {ownersCount} signatures.
              </Text>
              <Box p="x3" borderRadius="curved" backgroundColor="background2">
                <Text
                  variant="label-sm"
                  color="text3"
                  style={{ wordBreak: 'break-all', fontSize: '13px' }}
                >
                  Safe: {safeAddress}
                </Text>
              </Box>
            </Stack>
            <Stack gap="x2">
              <Button onClick={handleConfirm} w="100%" variant="primary">
                Propose Transaction
              </Button>
              <Button onClick={handleClose} variant="ghost" w="100%">
                Cancel
              </Button>
            </Stack>
          </>
        )}

        {/* Proposing State */}
        {state === 'proposing' && (
          <Stack gap="x4" align="center">
            <Text variant="heading-sm">Submitting to Safe Service...</Text>
            <Box style={{ fontSize: '48px' }}>⏳</Box>
            <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
              Please check your wallet and approve the signature request.
            </Text>
          </Stack>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <Stack gap="x2" align="center">
              <Box style={{ fontSize: '56px', lineHeight: 1 }}>✓</Box>
              <Text variant="heading-sm">Transaction Proposed</Text>
              <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
                This transaction has been submitted to your Safe and is awaiting
                signatures from other owners.
              </Text>
            </Stack>
            <Stack gap="x2">
              {safeAppUrl && (
                <Button
                  as="a"
                  href={safeAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  w="100%"
                  variant="primary"
                >
                  <Flex align="center" justify="center" gap="x2">
                    View in Safe App
                    <Icon id="external-16" />
                  </Flex>
                </Button>
              )}
              <Button onClick={handleClose} variant="ghost" w="100%">
                Close
              </Button>
            </Stack>
          </>
        )}

        {/* Error State */}
        {state === 'error' && (
          <>
            <Stack gap="x2" align="center">
              <Box style={{ fontSize: '56px', lineHeight: 1, color: '#FF3B30' }}>✕</Box>
              <Text variant="heading-sm">Transaction Failed</Text>
              {error && (
                <Box
                  p="x3"
                  borderRadius="curved"
                  style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
                  w="100%"
                >
                  <Text
                    variant="paragraph-sm"
                    color="negative"
                    style={{ wordBreak: 'break-word' }}
                  >
                    {error}
                  </Text>
                </Box>
              )}
            </Stack>
            <Stack gap="x2">
              <Button onClick={() => setState('idle')} w="100%" variant="primary">
                Try Again
              </Button>
              <Button onClick={handleClose} variant="ghost" w="100%">
                Cancel
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </SafeToastModal>
  )
}
