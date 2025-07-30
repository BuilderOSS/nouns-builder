import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { Button, Flex } from '@buildeross/zord'
import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

import { AllBids } from './AllBids'

const AnimatedModal = dynamic(() => import('src/components/Modal/AnimatedModal'), {
  ssr: false,
})

export const BidHistory = ({ bids }: { bids: AuctionBidFragment[] }) => {
  return (
    <AnimatedModal
      trigger={
        <Button
          fontSize={18}
          width={'100%'}
          variant="secondary"
          borderRadius="curved"
          h="x14"
        >
          Bid history
        </Button>
      }
    >
      <AllBids bids={bids} />
    </AnimatedModal>
  )
}

export const ActionsWrapper = ({ children }: { children: ReactNode }) => (
  <Flex direction="column" align="center" mt={{ '@initial': 'x4', '@768': 'x6' }}>
    {children}
  </Flex>
)
