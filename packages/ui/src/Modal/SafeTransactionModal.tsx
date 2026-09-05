'use client'

import { SAFE_CHAIN_PREFIX } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import {
  getSafeErrorMessage,
  isUserCancellation,
  truncateAddress,
} from '@buildeross/utils'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import type { Address } from 'viem'

import { SafeToastModal } from './SafeToastModal'

interface SafeTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  safeAddress: Address
  threshold: number
  ownersCount: number
  chainId: CHAIN_ID
  targetAddress: string
  txValue?: string
  txData?: string
  transactions?: Array<{ to: string; value?: string; data?: string }>
  onConfirm: () => Promise<{ safeTxHash: string }>
}

export function SafeTransactionModal({
  isOpen,
  onClose,
  onRetry,
  safeAddress,
  threshold,
  ownersCount,
  chainId,
  targetAddress,
  txValue,
  txData,
  transactions = [{ to: targetAddress, value: txValue, data: txData }],
  onConfirm,
}: SafeTransactionModalProps) {
  const [state, setState] = useState<'idle' | 'proposing' | 'success' | 'error'>('idle')
  const [safeTxHash, setSafeTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    if (state !== 'idle') return
    setState('proposing')
    setError(null)

    try {
      const result = await onConfirm()
      setSafeTxHash(result.safeTxHash)
      setState('success')
    } catch (err) {
      const errorMessage = getSafeErrorMessage(err)
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
                <Text variant="label-sm" color="text3">
                  {transactions.length} action{transactions.length === 1 ? '' : 's'} will
                  be proposed
                </Text>
                {transactions.map((transaction, index) => (
                  <Box
                    key={`${transaction.to}-${index}`}
                    p="x2"
                    borderRadius="curved"
                    backgroundColor="background2"
                  >
                    <Text variant="label-sm" color="text3" style={{ fontSize: '12px' }}>
                      {index + 1}. To: {truncateAddress(transaction.to)}
                      {transaction.data && transaction.data !== '0x'
                        ? ` | Function: ${transaction.data.slice(0, 10)}`
                        : ''}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Stack>
            <Stack gap="x2">
              <Button
                onClick={handleConfirm}
                disabled={state !== 'idle'}
                w="100%"
                variant="primary"
              >
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
              Waiting for wallet signature...
            </Text>
            <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
              Review the transaction details in your wallet. After signing, the proposal
              will be submitted to your Safe.
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
                This transaction has been proposed to your Safe ({threshold} of{' '}
                {ownersCount} signature{ownersCount > 1 ? 's' : ''} required). Other
                owners can review and sign in the Safe App. It has not been executed
                on-chain yet.
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
                {isUserCancellation(error)
                  ? 'Transaction Cancelled'
                  : 'Transaction Proposal Failed'}
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
              <Button
                onClick={() => {
                  setError(null)
                  setState('idle')
                  onRetry()
                }}
                w="100%"
                variant="primary"
              >
                Try Again
              </Button>
              <Button onClick={handleClose} variant="ghost" w="100%">
                Close
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </SafeToastModal>
  )
}
