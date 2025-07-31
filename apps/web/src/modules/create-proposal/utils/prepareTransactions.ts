import { AddressType } from '@buildeross/types'
import { parseEther } from 'viem'

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

    return parseEther(value.toString())
  })

  return { calldata, targets, values }
}
