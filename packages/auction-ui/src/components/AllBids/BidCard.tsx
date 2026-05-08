import { useEnsData } from '@buildeross/hooks/useEnsData'
import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { WalletIdentity, WalletIdentityWithPreview } from '@buildeross/ui'
import { walletSnippet } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Flex, Icon, Text, vars } from '@buildeross/zord'

export const BidCard = ({
  bid,
  walletPreview = true,
}: {
  bid: AuctionBidFragment
  walletPreview?: boolean
}) => {
  const { displayName, ensAvatar } = useEnsData(bid?.bidder)
  const resolvedDisplayName = displayName || walletSnippet(bid.bidder as `0x${string}`)
  const comment = bid.comment?.trim()

  return (
    <Flex direction={'column'} my="x4" align="center">
      <Flex direction="row" width={'100%'} align="center" justify="space-between">
        {walletPreview ? (
          <WalletIdentityWithPreview
            address={bid.bidder as `0x${string}`}
            displayName={resolvedDisplayName}
            avatarSrc={ensAvatar}
            avatarSize="28"
            mobileTapBehavior="toggle"
          />
        ) : (
          <WalletIdentity
            address={bid.bidder as `0x${string}`}
            displayName={resolvedDisplayName}
            avatarSrc={ensAvatar}
            avatarSize="28"
            asLink
          />
        )}
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
      {comment ? (
        <Box mt="x2" width="100%">
          <Text
            variant="paragraph-sm"
            color="secondary"
            style={{ wordBreak: 'break-word' }}
          >
            {comment}
          </Text>
        </Box>
      ) : null}
      <Box
        mt="x2"
        style={{
          borderBottom: `1px solid ${vars.color.text4}`,
          width: '100%',
          opacity: 0.5,
        }}
      />
    </Flex>
  )
}
