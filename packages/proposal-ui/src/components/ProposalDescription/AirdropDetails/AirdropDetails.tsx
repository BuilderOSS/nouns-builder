import { useAirdropData } from '@buildeross/hooks/useAirdropData'
import { useTokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Spinner, Stack } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address, getAddress, isAddressEqual } from 'viem'

import { Section } from '../Section'
import { AirdropItem } from './AirdropItem'

interface AirdropDetailsProps {
  proposal: Proposal
}

export const AirdropDetails = ({ proposal }: AirdropDetailsProps) => {
  const { chain } = useChainStore()

  const { airdrops, isCreateTx, isLoadingCampaignAddresses, isLoadingCampaignLiveData } =
    useAirdropData(chain.id, proposal)

  const uniqueTokenAddresses = useMemo(
    () =>
      Array.from(
        new Set(
          airdrops
            .map((airdrop) => {
              try {
                return getAddress(airdrop.token)
              } catch {
                return null
              }
            })
            .filter((address): address is Address => !!address)
        )
      ),
    [airdrops]
  )

  const { metadata: tokenMetadataArray } = useTokenMetadata(
    chain.id,
    uniqueTokenAddresses
  )

  const airdropsWithMetadata = useMemo(
    () =>
      airdrops.map((airdrop) => {
        const tokenMetadata = tokenMetadataArray?.find(
          (meta) =>
            meta.address &&
            isAddressEqual(meta.address as Address, airdrop.token as Address)
        )

        return {
          ...airdrop,
          tokenMetadata,
        }
      }),
    [airdrops, tokenMetadataArray]
  )

  const isExecuted = !!proposal.executionTransactionHash

  if (!isCreateTx) return null

  return (
    <Section title="Sablier Airdrops">
      {isExecuted && (isLoadingCampaignAddresses || isLoadingCampaignLiveData) && (
        <Spinner size="md" />
      )}

      <Stack>
        {airdropsWithMetadata.map((airdrop, index) => (
          <AirdropItem
            key={`${airdrop.transactionIndex}-${index}`}
            airdrop={airdrop}
            index={index}
            isExecuted={isExecuted}
            chainId={chain.id}
            tokenMetadata={airdrop.tokenMetadata}
          />
        ))}
      </Stack>
    </Section>
  )
}
