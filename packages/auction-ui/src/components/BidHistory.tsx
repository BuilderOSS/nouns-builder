import { AuctionBidFragment } from '@buildeross/sdk/subgraph'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { AllBids } from './AllBids'

export const BidHistory = ({ bids }: { bids: AuctionBidFragment[] }) => {
  const [showBidHistoryModal, setShowBidHistoryModal] = React.useState(false)

  return (
    <AnimatedModal
      open={showBidHistoryModal}
      close={() => setShowBidHistoryModal(false)}
      trigger={
        <Button
          fontSize={18}
          width={'100%'}
          variant="secondary"
          borderRadius="curved"
          h="x14"
          onClick={() => setShowBidHistoryModal(true)}
        >
          Bid history
        </Button>
      }
    >
      <AllBids bids={bids} onClose={() => setShowBidHistoryModal(false)} />
    </AnimatedModal>
  )
}

export const ActionsWrapper = ({ children }: { children: ReactNode }) => (
  <Flex
    direction="column"
    align="center"
    mt={{ '@initial': 'x4', '@768': 'x6' }}
    gap="x2"
  >
    {children}
  </Flex>
)
