import {
  type CHAIN_ID,
  type DaoContractAddresses,
  type ProposalDescriptionMetadataV1,
  type ProposalTransactionBundle,
  type ProposalTransactionBundleContext,
  type SimulationOutput,
} from '@buildeross/types'
import { DecodedTransactions } from '@buildeross/ui/DecodedTransactions'
import { atoms, Flex, Stack, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'

import { normalizeTextForCompare, TRANSACTION_TYPES } from '../../constants'
import { TransactionTypeIcon } from '../TransactionTypeIcon'

type DecodedTransactionsProp = React.ComponentProps<
  typeof DecodedTransactions
>['decodedTransactions']

type BundleWithRange = ProposalTransactionBundle & {
  bundleIndex: number
  start: number
  end: number
}

interface BundledDecodedTransactionsProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  decodedTransactions?: DecodedTransactionsProp
  proposalMetadata?: ProposalDescriptionMetadataV1
  transactionBundles?: ProposalTransactionBundle[]
  simulationByIndex?: Record<number, SimulationOutput>
  isDecoding?: boolean
}

const getBundleIntent = (summary: string | undefined, fallback: string | undefined) => {
  if (!summary) return fallback
  if (!fallback) return summary

  return normalizeTextForCompare(summary) === normalizeTextForCompare(fallback)
    ? fallback
    : summary
}

export const BundledDecodedTransactions: React.FC<BundledDecodedTransactionsProps> = ({
  chainId,
  addresses,
  decodedTransactions,
  proposalMetadata,
  transactionBundles,
  simulationByIndex,
  isDecoding = false,
}) => {
  const bundlesWithRanges = useMemo(() => {
    if (!decodedTransactions?.length || !transactionBundles?.length) return undefined

    const isValid = transactionBundles.every(
      (bundle) =>
        bundle &&
        typeof bundle.type === 'string' &&
        typeof bundle.callCount === 'number' &&
        (bundle.summary === undefined ||
          bundle.summary === null ||
          typeof bundle.summary === 'string') &&
        bundle.callCount > 0
    )

    if (!isValid) return undefined

    let cursor = 0
    const ranges: BundleWithRange[] = []

    for (let bundleIndex = 0; bundleIndex < transactionBundles.length; bundleIndex++) {
      const bundle = transactionBundles[bundleIndex]
      const start = cursor
      const end = cursor + bundle.callCount
      ranges.push({ ...bundle, bundleIndex, start, end })
      cursor = end
    }

    if (cursor !== decodedTransactions.length) {
      console.warn('Transaction bundle count mismatch; falling back to decoded-only.')
      return undefined
    }

    return ranges
  }, [decodedTransactions, transactionBundles])

  if (bundlesWithRanges?.length) {
    return (
      <Stack gap="x4">
        {bundlesWithRanges.map((bundle) => {
          const transactionTypeMeta =
            TRANSACTION_TYPES[bundle.type as keyof typeof TRANSACTION_TYPES]
          const bundleIntent = getBundleIntent(
            bundle.summary,
            transactionTypeMeta?.subTitle || transactionTypeMeta?.title
          )
          const bundleDecodedTransactions = decodedTransactions?.slice(
            bundle.start,
            bundle.end
          )

          const bundleContext: Omit<
            ProposalTransactionBundleContext,
            'positionInBundle'
          > = {
            bundleIndex: bundle.bundleIndex,
            bundleType: bundle.type,
            bundleIntent,
            bundleTypeTitle: transactionTypeMeta?.title,
            bundleCallCount: bundle.callCount,
          }

          return (
            <Stack
              key={`${bundle.bundleIndex}-${bundle.type}-${bundle.start}`}
              className={atoms({
                borderColor: 'border',
                borderStyle: 'solid',
                borderWidth: 'normal',
                borderRadius: 'curved',
              })}
              p="x3"
              gap="x3"
              align="stretch"
            >
              <Flex align="center" gap="x2">
                <TransactionTypeIcon transactionType={bundle.type} />
                <Stack gap="x1">
                  <Text fontWeight="heading">{bundleIntent || bundle.type}</Text>
                  <Text color="text3">
                    {bundle.callCount} {bundle.callCount === 1 ? 'call' : 'calls'}
                  </Text>
                </Stack>
              </Flex>

              {!!bundleDecodedTransactions?.length && (
                <DecodedTransactions
                  decodedTransactions={bundleDecodedTransactions}
                  chainId={chainId}
                  addresses={addresses}
                  isDecoding={isDecoding}
                  startIndex={bundle.start}
                  proposalMetadata={proposalMetadata}
                  simulationByIndex={simulationByIndex}
                  bundleContext={bundleContext}
                />
              )}
            </Stack>
          )
        })}
      </Stack>
    )
  }

  return (
    <DecodedTransactions
      decodedTransactions={decodedTransactions}
      chainId={chainId}
      addresses={addresses}
      isDecoding={isDecoding}
      proposalMetadata={proposalMetadata}
      simulationByIndex={simulationByIndex}
    />
  )
}
