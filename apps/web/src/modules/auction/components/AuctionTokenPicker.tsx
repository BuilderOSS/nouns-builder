import type { AddressType } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as OptionalLink } from '@buildeross/ui/LinkWrapper'
import { Box, Flex, Icon, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import React from 'react'
import { useChainStore } from 'src/stores'

import { useNextAndPreviousTokens } from '../hooks/useNextAndPreviousTokens'
import { auctionDateNavButton, auctionTextVariants } from './Auction.css'

interface AuctionTokenPickerProps {
  collection: AddressType
  tokenId: number
  currentTokenId?: number
  mintDate?: number
  name?: string
}

export const AuctionTokenPicker: React.FC<AuctionTokenPickerProps> = ({
  collection,
  tokenId,
  mintDate,
  name,
  currentTokenId,
}: AuctionTokenPickerProps) => {
  const { id: chainId } = useChainStore((x) => x.chain)
  const disabledStyle = { opacity: 0.2 }
  const { getAuctionLink } = useLinks()

  const data = useNextAndPreviousTokens({ chainId, collection, tokenId })

  const hasPreviousToken = data?.prev !== undefined
  const hasNextToken = data?.next !== undefined
  const hasLatestToken = data?.latest !== undefined
  const latestTokenId =
    hasLatestToken && currentTokenId !== undefined && data?.latest !== currentTokenId
      ? currentTokenId
      : data?.latest
  const latestText =
    hasLatestToken && currentTokenId !== undefined && data?.latest !== currentTokenId
      ? `Current Auction`
      : `Latest Auction`

  return (
    <Flex direction={'column'}>
      <Flex align="center" direction={'row'} gap={'x2'}>
        <OptionalLink
          enabled={hasPreviousToken}
          link={getAuctionLink(chainId, collection, data?.prev)}
        >
          <Flex align={'center'} justify={'center'} className={auctionDateNavButton}>
            <Icon id="arrowLeft" style={hasPreviousToken ? {} : disabledStyle} />
          </Flex>
        </OptionalLink>

        <OptionalLink
          enabled={hasNextToken}
          link={getAuctionLink(chainId, collection, data?.next)}
        >
          <Flex align={'center'} justify={'center'} className={auctionDateNavButton}>
            <Icon id="arrowRight" style={hasNextToken ? {} : disabledStyle} />
          </Flex>
        </OptionalLink>

        <OptionalLink
          enabled={hasLatestToken}
          link={getAuctionLink(chainId, collection, latestTokenId)}
        >
          <Flex align={'center'} justify={'center'} className={auctionDateNavButton}>
            <Text
              mx={'x3'}
              style={hasLatestToken ? {} : disabledStyle}
              fontWeight={'display'}
              display={{ '@initial': 'block', '@1024': 'none' }}
            >
              {latestText.split(' ')[0]}
            </Text>
            <Text
              mx={'x3'}
              style={hasLatestToken ? {} : disabledStyle}
              fontWeight={'display'}
              display={{ '@initial': 'none', '@1024': 'block' }}
            >
              {latestText}
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
