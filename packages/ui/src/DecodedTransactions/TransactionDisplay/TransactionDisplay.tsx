import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { CHAIN_ID, DaoContractAddresses } from '@buildeross/types'
import React from 'react'

import { DecodedDisplay } from './DecodedDisplay'
import { NonDecodedDisplay } from './NonDecodedDisplay'

export const TransactionDisplay: React.FC<
  DecodedTransaction & {
    chainId: CHAIN_ID
    addresses: DaoContractAddresses
    index: number
  }
> = ({ chainId, addresses, index, ...decoded }) => {
  if (decoded.isNotDecoded || !decoded.transaction.args) {
    const calldata = decoded.isNotDecoded
      ? decoded.transaction
      : decoded.transaction.encodedData

    return (
      <NonDecodedDisplay
        {...{ chainId, target: decoded.target, calldata, value: decoded.value, index }}
      />
    )
  }

  return (
    <DecodedDisplay
      {...{
        index,
        chainId,
        addresses,
        transaction: decoded.transaction,
        target: decoded.target,
        value: decoded.value,
      }}
    />
  )
}
