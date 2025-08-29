import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useNFTBalance } from '@buildeross/hooks/useNFTBalance'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { FallbackImage } from '@buildeross/ui'
import { Box, Flex, Grid, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React from 'react'
import Pagination from 'src/components/Pagination'
import { usePagination } from 'src/hooks'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

import { erc721AssetsWrapper } from './Treasury.css'

export const NFTBalance: React.FC = () => {
  const { addresses } = useDaoStore()
  const owner = addresses.treasury
  const chain = useChainStore((x) => x.chain)
  const { nfts: allNfts, isLoading } = useNFTBalance(chain.id, owner)
  const numNfts = allNfts?.length ?? 0
  const LIMIT = 9
  const { query } = useRouter()
  const { handlePageBack, handlePageForward } = usePagination(true)

  const hasNextPage = React.useMemo(() => {
    const totalPages = Math.ceil((numNfts || 0) / LIMIT)
    const currentPage = Number(query.page) || 1
    return currentPage < totalPages
  }, [numNfts, query.page])

  const nfts = React.useMemo(() => {
    const page = Number(query.page) || 1
    return allNfts?.slice((page - 1) * LIMIT, page * LIMIT)
  }, [allNfts, query.page])

  return (
    <>
      <Flex width={'100%'} align={'center'} gap="x6" justify={'space-between'} pr="x4">
        <Text fontSize={28} fontWeight={'display'}>
          NFTs
        </Text>
      </Flex>

      {numNfts === 0 && (
        <Flex
          direction={'column'}
          gap="x8"
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
            {' '}
            {isLoading ? 'Loading...' : 'No NFTs Found'}{' '}
          </Text>
        </Flex>
      )}

      {numNfts > 0 && (
        <Flex direction={'column'} width={'100%'} gap="x0">
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
            gap="x4"
            align="stretch"
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
          <Pagination
            onNext={handlePageForward}
            onPrev={handlePageBack}
            isLast={!hasNextPage}
            isFirst={!query.page}
          />
        </Flex>
      )}
    </>
  )
}
