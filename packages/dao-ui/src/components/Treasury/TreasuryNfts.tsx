'use client'

import { PUBLIC_IS_TESTNET } from '@buildeross/constants'
import { useEnrichedPinnedAssets } from '@buildeross/hooks/useEnrichedPinnedAssets'
import { useNFTBalance } from '@buildeross/hooks/useNFTBalance'
import { usePinnedAssets } from '@buildeross/hooks/usePinnedAssets'
import { tokensQuery } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType } from '@buildeross/types'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React, { useMemo, useState } from 'react'
import useSWR from 'swr'

import { card, cardLabel, emptyBox, grid, image } from './TreasuryNfts.css'

interface NftCard {
  key: string
  name: string
  image?: string
  isPinned: boolean
}

/**
 * Every NFT the treasury holds, via Alchemy (spam-filtered by default) merged
 * with the DAO's pinned NFTs. When Alchemy has nothing to say — no API key, or
 * a chain it doesn't cover — this falls back to the Builder subgraph, which
 * indexes the DAO's own tokens and needs no key.
 */
export const TreasuryNfts = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const treasury = addresses.treasury as AddressType | undefined
  const token = addresses.token as AddressType | undefined

  const [showSpamNfts, setShowSpamNfts] = useState(PUBLIC_IS_TESTNET)

  const {
    nfts,
    isLoading: nftsLoading,
    error: nftsError,
  } = useNFTBalance(chain.id, treasury, { filterSpam: !showSpamNfts })

  const { pinnedAssets } = usePinnedAssets(chain.id, token)
  const pinnedNfts = useMemo(
    () =>
      pinnedAssets?.filter(
        (p) => (p.tokenType === 1 || p.tokenType === 2) && !p.revoked
      ) ?? [],
    [pinnedAssets]
  )
  const { enrichedPinnedAssets } = useEnrichedPinnedAssets(chain.id, treasury, pinnedNfts)

  const alchemyCards = useMemo<NftCard[]>(() => {
    if (!nfts && !enrichedPinnedAssets) return []

    const byKey = new Map<string, NftCard>()

    nfts?.forEach((nft) => {
      const key = `${nft.contract.address.toLowerCase()}-${nft.tokenId}`
      byKey.set(key, {
        key,
        name: nft.name || nft.collection?.name || `#${nft.tokenId}`,
        image: nft.image?.originalUrl || undefined,
        isPinned: false,
      })
    })

    enrichedPinnedAssets?.forEach((asset) => {
      if (asset.isCollection) {
        // A pinned collection marks everything already listed from it.
        byKey.forEach((entry, key) => {
          if (key.startsWith(`${asset.token.toLowerCase()}-`)) {
            byKey.set(key, { ...entry, isPinned: true })
          }
        })
        return
      }
      const key = `${asset.token.toLowerCase()}-${asset.tokenId}`
      const existing = byKey.get(key)
      byKey.set(key, {
        key,
        name: asset.nftName || existing?.name || `#${asset.tokenId}`,
        image: asset.nftImage || existing?.image,
        isPinned: true,
      })
    })

    // Pinned first, otherwise Alchemy's order.
    return Array.from(byKey.values()).sort((a, b) =>
      a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1
    )
  }, [nfts, enrichedPinnedAssets])

  const useAlchemy = alchemyCards.length > 0

  // Fallback source: the DAO's own tokens held by the treasury.
  const {
    data: subgraphData,
    isValidating: subgraphValidating,
    error: subgraphError,
  } = useSWR(
    !useAlchemy && !nftsLoading && treasury && chain.id
      ? (['treasury-dao-nfts', chain.id, treasury] as const)
      : null,
    ([, _chainId, _treasury]) => tokensQuery(_chainId, _treasury),
    { revalidateOnFocus: false }
  )

  const subgraphCards = useMemo<NftCard[]>(
    () =>
      (subgraphData?.tokens ?? []).map((t) => ({
        key: `${t.tokenContract}-${t.tokenId}`,
        name: t.name || `#${t.tokenId}`,
        image: t.image ?? undefined,
        isPinned: false,
      })),
    [subgraphData]
  )

  const cards = useAlchemy ? alchemyCards : subgraphCards

  if (!treasury) return null

  const isLoading = nftsLoading || (!useAlchemy && subgraphValidating)
  // A fetch failure must read as an error, not "no NFTs" — otherwise it's
  // indistinguishable from a legitimately empty treasury.
  const failed = !!nftsError && !!subgraphError
  const emptyMessage = failed
    ? "Couldn't load treasury NFTs. Please try again later."
    : isLoading
      ? 'Loading…'
      : 'No NFTs held in the treasury.'

  return (
    <Flex direction={'column'} width={'100%'} mb={'x8'}>
      <Flex width={'100%'} justify={'space-between'} align={'baseline'} mb={'x4'}>
        <Text fontSize={20} fontWeight={'display'}>
          NFTs
        </Text>
        <Flex align={'center'} gap={'x3'}>
          {cards.length > 0 && (
            <Text variant="paragraph-md" color={'tertiary'}>
              {cards.length}
              {!useAlchemy && subgraphData?.hasNextPage ? '+' : ''} in treasury
            </Text>
          )}
          {/* Keep the toggle reachable when the request failed: spam filtering is
              itself what a restricted Alchemy plan rejects, so hiding it on
              error strands the viewer with no way to retry unfiltered. */}
          {(nfts !== undefined || !!nftsError) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowSpamNfts((x) => !x)}
            >
              {showSpamNfts ? 'Hide spam' : 'Show spam'}
            </Button>
          )}
        </Flex>
      </Flex>

      {cards.length === 0 ? (
        <Box className={emptyBox}>
          <Text variant="paragraph-md" color={failed ? 'negative' : 'tertiary'}>
            {emptyMessage}
          </Text>
        </Box>
      ) : (
        <Box className={grid}>
          {cards.map((nft) => (
            <Box key={nft.key} className={card}>
              <FallbackImage src={nft.image} alt={nft.name} className={image} />
              <div className={cardLabel}>{nft.name}</div>
            </Box>
          ))}
        </Box>
      )}
    </Flex>
  )
}
