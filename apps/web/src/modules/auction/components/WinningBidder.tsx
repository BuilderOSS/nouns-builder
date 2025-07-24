import { NULL_ADDRESS } from '@buildeross/constants/addresses'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEnsData } from '@buildeross/hooks/useEnsData'
import { Box, Flex } from '@buildeross/zord'
import { Avatar } from 'src/components/Avatar'
import { Icon } from 'src/components/Icon'
import { useChainStore } from 'src/stores/useChainStore'

import { AuctionDetail } from './AuctionDetail'

export const WinningBidder = ({ owner }: { owner?: string }) => {
  const { displayName, ensAvatar } = useEnsData(owner)
  const chain = useChainStore((x) => x.chain)

  return (
    <AuctionDetail title="Held by">
      {!owner || owner === NULL_ADDRESS ? (
        'n/a'
      ) : (
        <Flex direction={'row'} align={'center'}>
          <Avatar address={owner} src={ensAvatar} size={'24'} />
          <Box
            as="a"
            href={`${ETHERSCAN_BASE_URL[chain.id]}/address/${owner}`}
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
