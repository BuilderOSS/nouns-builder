import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnrichedPinnedAssets } from '@buildeross/hooks/useEnrichedPinnedAssets'
import { useNFTBalance } from '@buildeross/hooks/useNFTBalance'
import { usePinnedAssets } from '@buildeross/hooks/usePinnedAssets'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { skeletonAnimation } from '@buildeross/ui/styles'
import { Box, Flex, Grid, Icon, Text } from '@buildeross/zord'
import React, { useMemo } from 'react'

import { erc721AssetsWrapper } from './Treasury.css'

export const NFTBalance: React.FC = () => {
  const { addresses } = useDaoStore()
  const owner = addresses.treasury
  const chain = useChainStore((x) => x.chain)
  const { nfts: allNfts, isLoading: nftsLoading } = useNFTBalance(chain.id, owner)

  // Fetch pinned assets
  const { pinnedAssets, isLoading: pinnedLoading } = usePinnedAssets(
    chain.id,
    addresses.token
  )

  // Filter NFT pinned assets (ERC721 and ERC1155)
  const pinnedNFTs = useMemo(
    () =>
      pinnedAssets?.filter(
        (p) => (p.tokenType === 1 || p.tokenType === 2) && !p.revoked
      ) || [],
    [pinnedAssets]
  )

  // Fetch enriched pinned NFTs
  const { enrichedPinnedAssets, isLoading: enrichedLoading } = useEnrichedPinnedAssets(
    chain.id,
    addresses.treasury,
    pinnedNFTs
  )

  // Combine and dedupe NFTs with pinned assets
  const allNftsWithPinned = useMemo(() => {
    if (!allNfts && !enrichedPinnedAssets) return []

    const nftMap = new Map<string, any>()

    // Add standard NFTs
    allNfts?.forEach((nft) => {
      const key = `${nft.contract.address.toLowerCase()}-${nft.tokenId}`
      nftMap.set(key, {
        ...nft,
        isPinned: false,
      })
    })

    // Add/override with pinned NFTs (ensures low-value pinned NFTs appear)
    enrichedPinnedAssets?.forEach((asset) => {
      if (asset.isCollection) {
        // For collection pins, mark all NFTs from that collection as pinned
        nftMap.forEach((nft, key) => {
          if (nft.contract.address.toLowerCase() === asset.token.toLowerCase()) {
            nftMap.set(key, { ...nft, isPinned: true })
          }
        })
      } else {
        // For individual NFT pins
        const key = `${asset.token.toLowerCase()}-${asset.tokenId}`
        const existing = nftMap.get(key)

        nftMap.set(key, {
          name: asset.nftName || existing?.name || '',
          tokenId: asset.tokenId || existing?.tokenId || '',
          contract: {
            address: asset.token,
          },
          collection: {
            name: existing?.collection?.name || '',
          },
          image: {
            originalUrl: existing?.image?.originalUrl || asset.nftImage || '',
          },
          tokenType: asset.tokenType === 1 ? 'ERC721' : 'ERC1155',
          balance: existing?.balance || '1',
          isPinned: true,
        })
      }
    })

    return Array.from(nftMap.values())
  }, [allNfts, enrichedPinnedAssets])

  // Sort: pinned first, then original order
  const sortedNfts = useMemo(
    () =>
      [...allNftsWithPinned].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return 0
      }),
    [allNftsWithPinned]
  )

  const numNfts = sortedNfts?.length ?? 0
  const isLoading = nftsLoading || pinnedLoading || enrichedLoading

  const nfts = sortedNfts

  return (
    <>
      <Flex width={'100%'} align={'center'} gap="x6" justify={'space-between'} pr="x4">
        <Text fontSize={28} fontWeight={'display'}>
          NFTs
        </Text>
      </Flex>

      {isLoading && numNfts === 0 && (
        <Grid
          className={erc721AssetsWrapper}
          display={'grid'}
          px={{ '@initial': 'x4', '@768': 'x20' }}
          py={{ '@initial': 'x4', '@768': 'x8' }}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          mt={'x6'}
          align="stretch"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Box
              key={index}
              aspectRatio={1}
              backgroundColor={'background2'}
              borderRadius="curved"
              style={{ animation: skeletonAnimation }}
            />
          ))}
        </Grid>
      )}

      {!isLoading && numNfts === 0 && (
        <Flex
          direction={'column'}
          px={{ '@initial': 'x4', '@768': 'x20' }}
          py={{ '@initial': 'x4', '@768': 'x8' }}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          mt={'x6'}
          mb={'x8'}
          align="center"
          justify="center"
        >
          <Text variant="paragraph-md" color={'tertiary'}>
            No NFTs Found
          </Text>
        </Flex>
      )}

      {numNfts > 0 && (
        <Grid
          className={erc721AssetsWrapper}
          display={'grid'}
          px={{ '@initial': 'x4', '@768': 'x20' }}
          py={{ '@initial': 'x4', '@768': 'x8' }}
          borderColor={'border'}
          borderStyle={'solid'}
          borderRadius={'curved'}
          borderWidth={'normal'}
          mt={'x6'}
          align="stretch"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {nfts?.map((nft) => {
            const originalUrl = nft.image.originalUrl
            if (!originalUrl) return null
            const url =
              ETHERSCAN_BASE_URL[chain.id] +
              '/token/' +
              nft.contract.address +
              '?a=' +
              owner
            return (
              <Flex
                as="a"
                href={url}
                target="_blank"
                rel="noreferrer"
                key={nft.name + nft.tokenId + nft.contract.address}
                direction={'column'}
                gap="x2"
                borderColor={'border'}
                borderStyle={'solid'}
                borderRadius={'curved'}
                borderWidth={'normal'}
                align="stretch"
                style={{ maxWidth: '100%', overflow: 'hidden' }}
              >
                <Box aspectRatio={1} backgroundColor={'border'}>
                  <FallbackImage
                    src={originalUrl}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 'inherit',
                    }}
                  />
                </Box>
                <Flex direction={'column'} gap="x2">
                  <Flex
                    justify={'space-between'}
                    px="x2"
                    gap="x4"
                    align="center"
                    style={{ maxWidth: '100%', overflow: 'hidden' }}
                  >
                    <Flex align={'center'} gap="x1" style={{ minWidth: 0, flex: 1 }}>
                      <Text
                        fontSize={16}
                        fontWeight={'display'}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: '0px',
                        }}
                      >
                        {nft.name ?? '‎ '}
                      </Text>
                      {nft.isPinned && <Icon id="pin" size="sm" color="text3" />}
                    </Flex>
                    {nft.tokenType === 'ERC1155' && (
                      <Text
                        fontSize={12}
                        color={'secondary'}
                        px="x1"
                        borderColor={'border'}
                        borderStyle={'solid'}
                        borderRadius={'curved'}
                        borderWidth={'normal'}
                      >
                        {nft.balance}
                      </Text>
                    )}
                  </Flex>
                  <Text
                    fontSize={14}
                    color={'secondary'}
                    px="x2"
                    pb="x2"
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      minWidth: '0px',
                    }}
                  >
                    {nft.collection?.name ?? '‎ '}
                  </Text>
                </Flex>
              </Flex>
            )
          })}
        </Grid>
      )}
    </>
  )
}
