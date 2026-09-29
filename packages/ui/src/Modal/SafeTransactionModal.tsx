'use client'

import { SAFE_CHAIN_PREFIX } from '@buildeross/constants/safe'
import type { CHAIN_ID } from '@buildeross/types'
import {
  getBlockExplorerTxUrl,
  isUserCancellation,
  truncateAddress,
} from '@buildeross/utils'
import { Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { useEffect } from 'react'
import type { Address } from 'viem'

import { SafeToastModal } from './SafeToastModal'

interface SafeTransactionModalProps {
  isOpen: boolean
  mode: 'execute' | 'propose'
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
  txHash?: string
  safeTxHash?: string
  isExecuting: boolean
  isSuccess: boolean
  isError: boolean
  error: string | null
}

export function SafeTransactionModal({
  isOpen,
  mode,
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
  txHash,
  safeTxHash,
  isExecuting,
  isSuccess,
  isError,
  error,
}: SafeTransactionModalProps) {
  // Auto-close on success after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onClose])

  const safeAppUrl =
    safeTxHash && SAFE_CHAIN_PREFIX[chainId]
      ? `https://app.safe.global/transactions/queue?safe=${SAFE_CHAIN_PREFIX[chainId]}:${safeAddress}`
      : null

  const blockExplorerUrl = txHash ? getBlockExplorerTxUrl(chainId, txHash) : null

  return (
    <SafeToastModal isOpen={isOpen} onClose={onClose}>
      <Stack gap="x3">
        {/* Executing/Proposing State */}
        {isExecuting && (
          <Stack gap="x3" align="center">
            <Spinner size="lg" />
            <Text variant="label-md" color="text1">
              {mode === 'execute' ? 'Executing transaction...' : 'Creating proposal...'}
            </Text>
            <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
              {mode === 'execute'
                ? 'Review the transaction in your wallet and confirm to execute it directly on-chain.'
                : `Review the transaction in your wallet. After signing, the proposal will be submitted to your Safe (${threshold} of ${ownersCount} signature${ownersCount > 1 ? 's' : ''} required).`}
            </Text>
            <Stack gap="x2" w="100%">
              <Text variant="label-sm" color="text3">
                {transactions.length} action{transactions.length === 1 ? '' : 's'}
              </Text>
              {transactions.map((transaction, index) => (
                <Box
                  key={`${transaction.to}-${index}`}
                  p="x2"
                  borderRadius="curved"
                  backgroundColor="background2"
                >
                  <Text variant="label-sm" color="text3">
                    {transactions.length > 1 ? `${index + 1}. ` : ''}To:{' '}
                    {truncateAddress(transaction.to)}
                    {transaction.data && transaction.data !== '0x'
                      ? ` | Function: ${transaction.data.slice(0, 10)}`
                      : ''}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Stack>
        )}

        {/* Success State */}
        {isSuccess && (
          <>
            <Stack gap="x2" align="center">
              <Icon id="check-in-circle" size="xl" color="positive" />
              <Text variant="label-md" color="text1">
                {mode === 'execute' ? 'Transaction Executed' : 'Transaction Proposed'}
              </Text>
              <Text variant="paragraph-sm" color="text3" style={{ textAlign: 'center' }}>
                {mode === 'execute'
                  ? 'Your transaction has been executed on-chain and is being confirmed by the network.'
                  : `This transaction has been proposed to your Safe (${threshold} of ${ownersCount} signature${ownersCount > 1 ? 's' : ''} required). Other owners can review and sign in the Safe App.`}
              </Text>
            </Stack>
            <Stack gap="x2">
              {mode === 'execute' && blockExplorerUrl && (
                <Button
                  as="a"
                  href={blockExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  w="100%"
                  variant="primary"
                >
                  <Flex align="center" justify="center" gap="x2">
                    View on Block Explorer
                    <Icon id="external-16" />
                  </Flex>
                </Button>
              )}
              {mode === 'propose' && safeAppUrl && (
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
              <Button onClick={onClose} variant="ghost" w="100%">
                Close
              </Button>
            </Stack>
          </>
        )}

        {/* Error State */}
        {isError && (
          <>
            <Stack gap="x2" align="center">
              <Icon id="cross" size="xl" color="negative" />
              <Text variant="label-md" color="text1">
                {isUserCancellation(error)
                  ? 'Transaction Cancelled'
                  : mode === 'execute'
                    ? 'Transaction Failed'
                    : 'Proposal Failed'}
              </Text>
              {error && (
                <Box
                  p="x2"
                  borderRadius="curved"
                  backgroundColor="negativeDisabled"
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
              <Button onClick={onRetry} w="100%" variant="primary">
                Try Again
              </Button>
              <Button onClick={onClose} variant="ghost" w="100%">
                Close
              </Button>
            </Stack>
          </>
        )}
      </Stack>
    </SafeToastModal>
  )
}
