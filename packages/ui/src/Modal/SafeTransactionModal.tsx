'use client'

import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { SAFE_CHAIN_PREFIX } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import { formatCryptoVal, truncateAddress } from '@buildeross/utils'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import { type Address, formatEther } from 'viem'

import { SafeToastModal } from './SafeToastModal'

interface SafeTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  safeAddress: Address
  threshold: number
  ownersCount: number
  chainId: CHAIN_ID
  targetAddress: string
  txValue?: string
  txData?: string
  onConfirm: () => Promise<{ safeTxHash: string }>
}

export function SafeTransactionModal({
  isOpen,
  onClose,
  safeAddress,
  threshold,
  ownersCount,
  chainId,
  targetAddress,
  txValue,
  txData,
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
    safeTxHash && SAFE_CHAIN_PREFIX[chainId]
      ? `https://app.safe.global/transactions/queue?safe=${SAFE_CHAIN_PREFIX[chainId]}:${safeAddress}`
      : null

  return (
    <SafeToastModal isOpen={isOpen} onClose={handleClose}>
      <Stack gap="x3">
        {/* Idle State */}
        {state === 'idle' && (
          <>
            <Stack gap="x2">
              <Text variant="label-md" color="text1">
                Propose Transaction to Safe
              </Text>
              <Text variant="paragraph-sm" color="text3">
                This is a multi-signature Safe wallet requiring {threshold} of{' '}
                {ownersCount} signatures.
              </Text>
              <Stack gap="x2">
                <Box p="x2" borderRadius="curved" backgroundColor="background2">
                  <Flex align="center" gap="x1">
                    <Text variant="label-sm" color="text3" style={{ fontSize: '12px' }}>
                      To:{' '}
                      <Text
                        as="a"
                        href={`${ETHERSCAN_BASE_URL[chainId]}/address/${targetAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="label-sm"
                        color="text3"
                        style={{
                          fontSize: '12px',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                        }}
                      >
                        {truncateAddress(targetAddress)}
                      </Text>
                    </Text>
                  </Flex>
                </Box>
                {txValue && txValue !== '0x0' && txValue !== '0' && (
                  <Box p="x2" borderRadius="curved" backgroundColor="background2">
                    <Text variant="label-sm" color="text3" style={{ fontSize: '12px' }}>
                      Value: {formatCryptoVal(formatEther(BigInt(txValue)))} ETH
                    </Text>
                  </Box>
                )}
                {txData && txData !== '0x' && (
                  <Box p="x2" borderRadius="curved" backgroundColor="background2">
                    <Text
                      variant="label-sm"
                      color="text3"
                      style={{ wordBreak: 'break-all', fontSize: '12px' }}
                    >
                      Function: {txData.slice(0, 10)}
                      {txData.length > 10 && '...'}
                    </Text>
                  </Box>
                )}
              </Stack>
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
          <Stack gap="x3" align="center">
            <Icon id="refresh" size="xl" />
            <Text variant="label-md" color="text1">
              Submitting to Safe Service...
            </Text>
            <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
              Please check your wallet and approve the signature request.
            </Text>
          </Stack>
        )}

        {/* Success State */}
        {state === 'success' && (
          <>
            <Stack gap="x2" align="center">
              <Icon id="check-in-circle" size="xl" color="positive" />
              <Text variant="label-md" color="text1">
                Transaction Proposed
              </Text>
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
              <Icon id="cross" size="xl" color="negative" />
              <Text variant="label-md" color="text1">
                Transaction Failed
              </Text>
              {error && (
                <Box
                  p="x2"
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
