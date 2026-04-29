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
      style={{ wordBreak: 'break-word', overflowWrap: 'break-word', width: '100%' }}
      gap="x4"
    >
      {decodedTransactions?.map((decoded, i) => {
        const index = startIndex + i
        const simulation = simulationByIndex?.[index]
        const isFailedSimulation = simulation && simulation.status === false

        return (
          <Flex
            direction="row"
            position="relative"
            gap="x2"
            w="100%"
            key={`${decoded.target}-${index}`}
            className={atoms({
              borderColor: isFailedSimulation ? 'warning' : 'border',
              borderStyle: 'solid',
              borderWidth: 'normal',
              borderRadius: 'curved',
              backgroundColor: 'background2',
            })}
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
              simulation={simulation}
              {...decoded}
            />
          </Flex>
        )
      })}
    </Stack>
  )
}
