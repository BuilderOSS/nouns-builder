import { AddressType } from '@buildeross/types'
import { hexToBigInt } from 'viem'

import { BuilderTransaction } from '../stores/useProposalStore'

interface ProposalTransactions {
  calldata: string[]
  targets: AddressType[]
  values: bigint[]
}

export const prepareProposalTransactions = (
  transactions: BuilderTransaction[]
): ProposalTransactions => {
  const flattenedTransactions = transactions.flatMap((txn) => txn.transactions)

  const calldata = flattenedTransactions.map((txn) => txn.calldata)
  const targets = flattenedTransactions.map((txn) => txn.target)
  const values = flattenedTransactions.map((txn) => {
    const value = !txn.value ? '0' : txn.value

    if (value.startsWith('0x')) {
      return hexToBigInt(value as `0x${string}`)
    }
    return BigInt(value)
  })

  return { calldata, targets, values }
}
