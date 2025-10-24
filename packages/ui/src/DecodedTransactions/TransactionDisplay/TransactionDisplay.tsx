import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import { CHAIN_ID, DaoContractAddresses } from '@buildeross/types'
import React from 'react'

import { DecodedDisplay } from './DecodedDisplay'
import { NonDecodedDisplay } from './NonDecodedDisplay'

export const TransactionDisplay: React.FC<
  DecodedTransaction & {
    chainId: CHAIN_ID
    addresses: DaoContractAddresses
  }
> = ({ chainId, addresses, ...decoded }) => {
  if (decoded.isNotDecoded || !decoded.transaction.args) {
    const calldata = decoded.isNotDecoded
      ? decoded.transaction
      : decoded.transaction.encodedData

    return <NonDecodedDisplay {...{ chainId, target: decoded.target, calldata }} />
  }

  return (
    <DecodedDisplay
      {...{
        chainId,
        addresses,
        transaction: decoded.transaction,
        target: decoded.target,
      }}
    />
  )
}
