import { CHAIN_ID } from '@buildeross/types'

import { type DecodedTransaction, decodeTransactions } from '../../../hooks/src'

export type TransactionDiffType = 'added' | 'removed' | 'changed' | 'unchanged'

export type TransactionComparison = {
  type: TransactionDiffType
  index: number
  oldTransaction?: DecodedTransaction
  newTransaction?: DecodedTransaction
}

/**
 * Extract calldata string from a DecodedTransaction
 */
export function getCalldataFromDecodedTransaction(tx: DecodedTransaction): string {
  if (tx.isNotDecoded) {
    return tx.transaction
  }
  return tx.transaction.encodedData
}

/**
 * Deep equality check for transactions
 * Compares target, value, and calldata
 */
export function transactionsAreEqual(
  tx1: DecodedTransaction,
  tx2: DecodedTransaction
): boolean {
  return (
    tx1.target === tx2.target &&
    tx1.value === tx2.value &&
    getCalldataFromDecodedTransaction(tx1) === getCalldataFromDecodedTransaction(tx2)
  )
}

/**
 * Compare two arrays of transactions and return diff information
 */
export async function compareTransactionArrays(
  chainId: CHAIN_ID,
  oldTargets: string[],
  oldCalldatas: string[],
  oldValues: string[],
  newTargets: string[],
  newCalldatas: string[],
  newValues: string[]
): Promise<TransactionComparison[]> {
  // Decode both transaction arrays in parallel
  const [oldDecoded, newDecoded] = await Promise.all([
    decodeTransactions(chainId, oldTargets, oldCalldatas, oldValues),
    decodeTransactions(chainId, newTargets, newCalldatas, newValues),
  ])

  const maxLength = Math.max(oldDecoded.length, newDecoded.length)
  const comparisons: TransactionComparison[] = []

  for (let i = 0; i < maxLength; i++) {
    const oldTx = oldDecoded[i]
    const newTx = newDecoded[i]

    if (!oldTx && newTx) {
      // Transaction was added
      comparisons.push({
        type: 'added',
        index: i,
        newTransaction: newTx,
      })
    } else if (oldTx && !newTx) {
      // Transaction was removed
      comparisons.push({
        type: 'removed',
        index: i,
        oldTransaction: oldTx,
      })
    } else if (oldTx && newTx) {
      // Both exist, check if they're equal
      if (transactionsAreEqual(oldTx, newTx)) {
        comparisons.push({
          type: 'unchanged',
          index: i,
          oldTransaction: oldTx,
          newTransaction: newTx,
        })
      } else {
        comparisons.push({
          type: 'changed',
          index: i,
          oldTransaction: oldTx,
          newTransaction: newTx,
        })
      }
    }
  }

  return comparisons
}
