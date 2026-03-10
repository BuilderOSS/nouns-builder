import { useAirdropData } from '@buildeross/hooks/useAirdropData'
import { useTokenMetadata } from '@buildeross/hooks/useTokenMetadata'
import { erc20Abi } from '@buildeross/sdk/contract'
import { Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { Spinner, Stack } from '@buildeross/zord'
import { useMemo } from 'react'
import { Address, getAddress, isAddressEqual } from 'viem'
import { useReadContracts } from 'wagmi'

import { Section } from '../Section'
import { AirdropItem } from './AirdropItem'

interface AirdropDetailsProps {
  proposal: Proposal
}

export const AirdropDetails = ({ proposal }: AirdropDetailsProps) => {
  const { chain } = useChainStore()

  const { airdrops, isCreateTx, isLoadingCampaignAddresses } = useAirdropData(
    chain.id,
    proposal
  )

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

  const balanceContracts = useMemo(
    () =>
      isExecuted
        ? airdropsWithMetadata
            .filter((airdrop) => !!airdrop.campaignAddress)
            .map((airdrop) => ({
              address: airdrop.token,
              abi: erc20Abi,
              functionName: 'balanceOf' as const,
              args: [airdrop.campaignAddress as Address],
              chainId: chain.id,
            }))
        : [],
    [isExecuted, airdropsWithMetadata, chain.id]
  )

  const { data: balanceResults, isLoading: isLoadingBalances } = useReadContracts({
    contracts: balanceContracts,
    allowFailure: true,
    query: {
      enabled: balanceContracts.length > 0,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  })

  const balancesByCampaign = useMemo(() => {
    if (!balanceResults || !isExecuted) return new Map<string, bigint>()

    const map = new Map<string, bigint>()
    let resultIndex = 0

    // `balanceResults` is built from the same filtered list used in `balanceContracts`
    // (only airdrops with a campaignAddress), so we only advance resultIndex for that subset.
    for (const airdrop of airdropsWithMetadata) {
      if (!airdrop.campaignAddress) continue
      const result = balanceResults[resultIndex]
      if (result?.status === 'success') {
        map.set(airdrop.campaignAddress.toLowerCase(), result.result as bigint)
      }
      resultIndex += 1
    }

    return map
  }, [balanceResults, isExecuted, airdropsWithMetadata])

  if (!isCreateTx) return null

  return (
    <Section title="Sablier Airdrops">
      {isExecuted && (isLoadingCampaignAddresses || isLoadingBalances) && (
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
            currentBalance={
              airdrop.campaignAddress
                ? balancesByCampaign.get(airdrop.campaignAddress.toLowerCase())
                : undefined
            }
          />
        ))}
      </Stack>
    </Section>
  )
}
