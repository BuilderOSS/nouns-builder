import { DecodedTransaction } from '@buildeross/hooks/useDecodedTransactions'
import {
  CHAIN_ID,
  DaoContractAddresses,
  ProposalDescriptionMetadataV1,
  ProposalTransactionBundleContext,
  SimulationOutput,
} from '@buildeross/types'
import { atoms, Flex, Stack } from '@buildeross/zord'
import React from 'react'

import { TransactionDisplay } from './TransactionDisplay'

interface DecodedTransactionProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
  decodedTransactions: DecodedTransaction[] | undefined
  startIndex?: number
  proposalMetadata?: ProposalDescriptionMetadataV1
  bundleContext?: Omit<ProposalTransactionBundleContext, 'positionInBundle'>
  simulationByIndex?: Record<number, SimulationOutput>
}

export const DecodedTransactions: React.FC<DecodedTransactionProps> = ({
  chainId,
  addresses,
  decodedTransactions,
  startIndex = 0,
  proposalMetadata,
  bundleContext,
  simulationByIndex,
}) => {
  return (
    <Stack
      style={{ maxWidth: 900, wordBreak: 'break-word', overflowWrap: 'break-word' }}
      gap="x4"
    >
      {decodedTransactions?.map((decoded, i) => {
        const index = startIndex + i

        return (
          <Flex
            direction="row"
            gap="x2"
            className={atoms({
              borderColor: 'border',
              borderStyle: 'solid',
              borderWidth: 'normal',
              borderRadius: 'curved',
            })}
            key={`${decoded.target}-${index}`}
          >
            <TransactionDisplay
              chainId={chainId}
              addresses={addresses}
              index={index}
              proposalMetadata={proposalMetadata}
              bundleContext={
                bundleContext
                  ? {
                      ...bundleContext,
                      positionInBundle: i + 1,
                    }
                  : undefined
              }
              simulation={simulationByIndex?.[index]}
              {...decoded}
            />
          </Flex>
        )
      })}
    </Stack>
  )
}
