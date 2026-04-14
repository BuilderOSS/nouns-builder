import { useEnsData } from '@buildeross/hooks/useEnsData'
import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Icon, Text } from '@buildeross/zord'
import React from 'react'

export const BidCard = ({ bid }: { bid: AuctionBidFragment }) => {
  const { displayName, ensAvatar } = useEnsData(bid?.bidder)
  const resolvedDisplayName = displayName || walletSnippet(bid.bidder as `0x${string}`)

  return (
    <Flex direction={'column'} my="x4" align="center" style={{ height: 35 }}>
      <Flex direction="row" width={'100%'} align="center" justify="space-between">
        <WalletIdentityWithPreview
          address={bid.bidder as `0x${string}`}
          displayName={resolvedDisplayName}
          avatarSrc={ensAvatar}
          avatarSize="28"
          mobileTapBehavior="toggle"
        />
        <Flex direction="row" align="center">
          <Flex
            as="a"
            href={`/profile/${bid.bidder}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Text mr="x2" variant="paragraph-md">
              {formatCryptoVal(bid.amount)} ETH
            </Text>
            <Icon id="external-16" fill="text4" size="sm" align={'center'} />
          </Flex>
        </Flex>
      </Flex>
      <Box
        mt="x2"
        style={{
          borderBottom: '1px solid #B3B3B3',
          width: '100%',
          opacity: 0.5,
        }}
      />
    </Flex>
  )
}
