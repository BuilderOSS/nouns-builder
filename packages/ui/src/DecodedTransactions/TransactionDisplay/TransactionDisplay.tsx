import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import {
  CHAIN_ID,
  DaoContractAddresses,
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundleContext,
  SimulationOutput,
} from '@buildeross/types'
import React from 'react'

import { DecodedDisplay } from './DecodedDisplay'
import { NonDecodedDisplay } from './NonDecodedDisplay'

export const TransactionDisplay: React.FC<
  DecodedTransaction & {
    chainId: CHAIN_ID
    addresses: DaoContractAddresses
    index: number
    proposalMetadata?: ProposalDescriptionMetadataV1
    bundleContext?: ProposalTransactionBundleContext
    simulation?: SimulationOutput
  }
> = ({
  chainId,
  addresses,
  index,
  proposalMetadata,
  bundleContext,
  simulation,
  ...decoded
}) => {
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
        proposalMetadata,
        bundleContext,
        simulation,
        transaction: decoded.transaction,
        target: decoded.target,
        value: decoded.value,
      }}
    />
  )
}
