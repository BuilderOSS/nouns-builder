import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNFTBalance } from '@buildeross/hooks/useNFTBalance'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import React from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { skeletonAnimation } from 'src/styles/animations.css'

import { erc721AssetsWrapper } from './Treasury.css'

export const NFTBalance: React.FC = () => {
  const { addresses } = useDaoStore()
  const owner = addresses.treasury
  const chain = useChainStore((x) => x.chain)
  const { nfts: allNfts, isLoading } = useNFTBalance(chain.id, owner)
  const numNfts = allNfts?.length ?? 0

  const nfts = allNfts

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
          style={{ maxHeight: '720px', overflow: 'auto' }}
        >
          {nfts?.map((nft) => {
            const fetchableUrls = getFetchableUrls(nft.image.originalUrl)
            const urls = fetchableUrls
              ? [nft.image.originalUrl, ...fetchableUrls]
              : [nft.image.originalUrl]
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
                    srcList={urls}
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
                    align="stretch"
                    style={{ maxWidth: '100%', overflow: 'hidden' }}
                  >
                    <Text
                      fontSize={14}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: '0px',
                      }}
                    >
                      {nft.name ?? '‎ '}
                    </Text>
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
                    fontSize={12}
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
