'use client'

import { tokensQuery } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box, Flex, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'

import { card, cardLabel, emptyBox, grid, image } from './TreasuryNfts.css'

/**
 * The DAO's own NFTs held in the treasury, read natively from the Builder
 * subgraph (`tokensQuery` filtered by owner = treasury). Unlike the Alchemy
 * NFT path this needs no API key, isn't spam-flagged, and can't 500 on large
 * treasuries — the subgraph already indexes every token the DAO mints.
 */
export const TreasuryNfts = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const treasury = addresses.treasury as AddressType | undefined

  const { data, isValidating } = useSWR(
    treasury && chain.id ? (['treasury-dao-nfts', chain.id, treasury] as const) : null,
    ([, _chainId, _treasury]) => tokensQuery(_chainId, _treasury),
    { revalidateOnFocus: false }
  )

  const tokens = data?.tokens ?? []

  if (!treasury) return null

  return (
    <Flex direction={'column'} width={'100%'} mb={'x8'}>
      <Flex width={'100%'} justify={'space-between'} align={'baseline'} mb={'x4'}>
        <Text fontSize={20} fontWeight={'display'}>
          NFTs
        </Text>
        {tokens.length > 0 && (
          <Text variant="paragraph-md" color={'tertiary'}>
            {tokens.length}
            {data?.hasNextPage ? '+' : ''} in treasury
          </Text>
        )}
      </Flex>

      {tokens.length === 0 ? (
        <Box className={emptyBox}>
          <Text variant="paragraph-md" color={'tertiary'}>
            {isValidating ? 'Loading…' : 'No DAO NFTs held in the treasury.'}
          </Text>
        </Box>
      ) : (
        <Box className={grid}>
          {tokens.map((t) => (
            <Box key={`${t.tokenContract}-${t.tokenId}`} className={card}>
              <FallbackImage
                src={t.image ?? undefined}
                alt={t.name || `#${t.tokenId}`}
                className={image}
              />
              <div className={cardLabel}>{t.name || `#${t.tokenId}`}</div>
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  )
}
