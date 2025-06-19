import { Box, Flex, Grid, Text } from '@zoralabs/zord'
import { getFetchableUrls } from 'ipfs-service'
import React from 'react'

import { FallbackImage } from 'src/components/FallbackImage'
import { ETHERSCAN_BASE_URL } from 'src/constants/etherscan'
import { SerializedNft } from 'src/services/alchemyService'
import { erc721AssetsWrapper } from 'src/styles/Proposals.css'
import { AddressType, CHAIN_ID } from 'src/typings'

export const NFTBalanceDisplay: React.FC<{
  nfts: SerializedNft[] | undefined
  chainId: CHAIN_ID
  owner: AddressType | undefined
}> = ({ nfts, chainId, owner }) => {
  if (!nfts || nfts.length === 0) return null

  return (
    <>
      <Flex width={'100%'} align={'center'} gap="x6" justify={'space-between'} pr="x4">
        <Text fontSize={28} fontWeight={'display'}>
          NFTs
        </Text>
      </Flex>

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
        mb={'x8'}
        gap="x4"
        align="stretch"
      >
        {nfts.map((nft) => {
          const fetchableUrls = getFetchableUrls(nft.image.originalUrl)
          const urls = fetchableUrls
            ? [nft.image.originalUrl, ...fetchableUrls]
            : [nft.image.originalUrl]
          const url =
            ETHERSCAN_BASE_URL[chainId] + '/token/' + nft.contract.address + '?a=' + owner
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
              <Flex direction={'column'} gap="x2" flexGrow={1}>
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
    </>
  )
}
