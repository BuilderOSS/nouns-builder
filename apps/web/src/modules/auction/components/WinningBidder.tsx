import { NULL_ADDRESS } from '@buildeross/constants/addresses'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Box, Flex } from '@buildeross/zord'
import { Avatar } from 'src/components/Avatar'
import { Icon } from 'src/components/Icon'

import { AuctionDetail } from './AuctionDetail'

export const WinningBidder = ({ owner }: { owner?: string }) => {
  const { displayName, ensAvatar } = useEnsData(owner)

  return (
    <AuctionDetail title="Held by">
      {!owner || owner === NULL_ADDRESS ? (
        'n/a'
      ) : (
        <Flex direction={'row'} align={'center'}>
          <Avatar address={owner} src={ensAvatar} size={'24'} />
          <Box
            as="a"
            href={`/profile/${owner}`}
            rel={'noopener noreferrer'}
            target="_blank"
            ml={'x2'}
          >
            {displayName}
          </Box>
          <Icon ml="x1" fill="text4" id="arrowTopRight" />
        </Flex>
      )}
    </AuctionDetail>
  )
}
