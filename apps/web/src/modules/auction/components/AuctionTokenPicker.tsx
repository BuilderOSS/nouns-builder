import SWR_KEYS from '@buildeross/constants/swrKeys'
import { SubgraphSDK } from '@buildeross/sdk/subgraph'
import { Box, Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import React from 'react'
import useSWR from 'swr'

import { Icon } from 'src/components/Icon'
import { OptionalLink } from 'src/components/OptionalLink'
import { useLayoutStore } from 'src/stores'
import { useChainStore } from 'src/stores/useChainStore'

import { auctionDateNavButton, auctionTextVariants } from './Auction.css'

interface AuctionTokenPickerProps {
  collection: string
  tokenId: number
  mintDate?: number
  name?: string
}

export const AuctionTokenPicker: React.FC<AuctionTokenPickerProps> = ({
  collection,
  tokenId,
  mintDate,
  name,
}: AuctionTokenPickerProps) => {
  const { id: chainId } = useChainStore((x) => x.chain)
  const { query, isReady } = useRouter()
  const { isMobile } = useLayoutStore()
  const disabledStyle = { opacity: 0.2 }

  const { data } = useSWR(
    isReady
      ? [SWR_KEYS.DAO_NEXT_AND_PREVIOUS_TOKENS, chainId, collection, tokenId]
      : null,
    () =>
      SubgraphSDK.connect(chainId)
        .daoNextAndPreviousTokens({ tokenId, tokenAddress: collection.toLowerCase() })
        .then((x) => ({
          next: x.next.length > 0 ? parseInt(x.next[0].tokenId) : undefined,
          prev: x.prev.length > 0 ? parseInt(x.prev[0].tokenId) : undefined,
          latest: x.latest.length > 0 ? parseInt(x.latest[0].tokenId) : undefined,
        }))
  )

  const hasPreviousToken = data?.prev !== undefined
  const hasNextToken = data?.next !== undefined

  return (
    <Flex direction={'column'}>
      <Flex align="center" direction={'row'} gap={'x2'}>
        <OptionalLink
          enabled={hasPreviousToken}
          href={`/dao/${query.network}/${collection}/${data?.prev}`}
          passHref
          legacyBehavior
        >
          <Flex
            as={hasPreviousToken ? 'a' : undefined}
            align={'center'}
            justify={'center'}
            className={auctionDateNavButton}
          >
            <Icon id="arrowLeft" style={hasPreviousToken ? {} : disabledStyle} />
          </Flex>
        </OptionalLink>

        <OptionalLink
          enabled={hasNextToken}
          href={`/dao/${query.network}/${collection}/${data?.next}`}
          passHref
          legacyBehavior
        >
          <Flex
            as={hasNextToken ? 'a' : undefined}
            align={'center'}
            justify={'center'}
            className={auctionDateNavButton}
          >
            <Icon id="arrowRight" style={hasNextToken ? {} : disabledStyle} />
          </Flex>
        </OptionalLink>

        <OptionalLink
          enabled={hasNextToken}
          href={`/dao/${query.network}/${collection}/${data?.latest}`}
          passHref
          legacyBehavior
        >
          <Flex
            as={hasNextToken ? 'a' : undefined}
            align={'center'}
            justify={'center'}
            className={auctionDateNavButton}
          >
            <Text
              mx={'x3'}
              style={hasNextToken ? {} : disabledStyle}
              fontWeight={'display'}
            >
              {isMobile ? 'Latest' : 'Latest Auction'}
            </Text>
          </Flex>
        </OptionalLink>

        <Box className={auctionTextVariants['tertiary']} ml={'x2'}>
          {!!mintDate && dayjs(mintDate).format('MMMM DD, YYYY')}
        </Box>
      </Flex>
      {!!name && (
        <Flex
          align={'center'}
          justify={'flex-start'}
          className={auctionTextVariants['primary']}
          mt={{ '@initial': 'x4', '@768': 'x2' }}
          mb={{ '@initial': 'x4', '@768': 'x6' }}
        >
          {name}
        </Flex>
      )}
    </Flex>
  )
}
