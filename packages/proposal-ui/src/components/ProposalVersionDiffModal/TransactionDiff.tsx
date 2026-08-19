import { type ProposalVersion } from '@buildeross/sdk/subgraph'
import { type DaoContractAddresses } from '@buildeross/stores'
import { type CHAIN_ID } from '@buildeross/types'
import { TransactionDisplay } from '@buildeross/ui/DecodedTransactions'
import { Box, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  compareTransactionArrays,
  type TransactionComparison,
} from '../../utils/compareTransactions'
import { DiffBadge } from './DiffBadge'
import * as styles from './TransactionDiff.css'

type TransactionDiffProps = {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  previousVersion: ProposalVersion
  currentVersion: ProposalVersion
}

export const TransactionDiff: React.FC<TransactionDiffProps> = ({
  chainId,
  addresses,
  previousVersion,
  currentVersion,
}) => {
  const [comparisons, setComparisons] = React.useState<TransactionComparison[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [expandedIndices, setExpandedIndices] = React.useState<Set<number>>(new Set())

  // Compute transaction diff
  React.useEffect(() => {
    const computeDiff = async () => {
      setIsLoading(true)
      try {
        const diff = await compareTransactionArrays(
          chainId,
          previousVersion.targets || [],
          previousVersion.calldatas || [],
          previousVersion.values || [],
          currentVersion.targets || [],
          currentVersion.calldatas || [],
          currentVersion.values || []
        )
        setComparisons(diff)
      } catch (error) {
        console.error('Error computing transaction diff:', error)
      } finally {
        setIsLoading(false)
      }
    }

    computeDiff()
  }, [chainId, previousVersion, currentVersion])

  const toggleExpanded = (index: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  if (isLoading) {
    return (
      <Flex justify="center" p="x6">
        <Text color="text3">Loading transaction comparison...</Text>
      </Flex>
    )
  }

  if (comparisons.length === 0) {
    return (
      <Flex justify="center" p="x6">
        <Text color="text3">No transactions to compare.</Text>
      </Flex>
    )
  }

  // Check if there are any actual changes (added, removed, or changed)
  const hasChanges = comparisons.some(
    (c) => c.type === 'added' || c.type === 'removed' || c.type === 'changed'
  )

  if (!hasChanges) {
    return <Text color="text3">No changes to transactions in this update.</Text>
  }

  return (
    <Stack gap="x4">
      {comparisons.map((comparison) => {
        const { type, index, oldTransaction, newTransaction } = comparison

        // Get the appropriate container class
        const containerClass = {
          added: styles.transactionDiffAdded,
          removed: styles.transactionDiffRemoved,
          changed: styles.transactionDiffChanged,
          unchanged: styles.transactionDiffUnchanged,
        }[type]

        // For changed transactions, show expandable view
        if (type === 'changed' && oldTransaction && newTransaction) {
          const isExpanded = expandedIndices.has(index)

          return (
            <Box key={index} className={styles.transactionDiffWrapper}>
              <Flex
                direction="row"
                position="relative"
                gap="x2"
                w="100%"
                className={`${containerClass} ${styles.changedTransactionContainer}`}
                onClick={() => toggleExpanded(index)}
              >
                <Stack w="100%" gap="x2">
                  <Flex align="center" gap="x2" p="x2">
                    <DiffBadge type="changed" />
                    <Text color="text3" fontSize={14}>
                      Click to {isExpanded ? 'collapse' : 'expand'} and see both versions
                    </Text>
                  </Flex>

                  {isExpanded ? (
                    <Stack gap="x4" className={styles.changedTransactionExpanded}>
                      <Stack gap="x2">
                        <Flex align="center" gap="x2">
                          <DiffBadge type="removed" />
                          <Text fontWeight="label" color="text3">
                            Original
                          </Text>
                        </Flex>
                        <TransactionDisplay
                          {...oldTransaction}
                          chainId={chainId}
                          addresses={addresses}
                          index={index}
                        />
                      </Stack>

                      <Stack gap="x2">
                        <Flex align="center" gap="x2">
                          <DiffBadge type="added" />
                          <Text fontWeight="label" color="text3">
                            Updated
                          </Text>
                        </Flex>
                        <TransactionDisplay
                          {...newTransaction}
                          chainId={chainId}
                          addresses={addresses}
                          index={index}
                        />
                      </Stack>
                    </Stack>
                  ) : (
                    <TransactionDisplay
                      {...newTransaction}
                      chainId={chainId}
                      addresses={addresses}
                      index={index}
                    />
                  )}
                </Stack>
              </Flex>
            </Box>
          )
        }

        // For other transaction types, show single view
        const transaction = newTransaction || oldTransaction
        if (!transaction) return null

        return (
          <Flex
            key={index}
            direction="row"
            position="relative"
            gap="x2"
            w="100%"
            className={containerClass}
          >
            <Stack w="100%" gap="x2">
              {type !== 'unchanged' && (
                <Flex p="x2">
                  <DiffBadge type={type} />
                </Flex>
              )}
              <TransactionDisplay
                {...transaction}
                chainId={chainId}
                addresses={addresses}
                index={index}
              />
            </Stack>
          </Flex>
        )
      })}
    </Stack>
  )
}
