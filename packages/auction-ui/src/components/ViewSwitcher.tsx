import { Button, Flex } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import { auctionWrapVariants, switcherBox } from './Auction.css'
import { buttonTab } from './AuctionChart/AuctionChart.css'

export enum ViewSection {
  Auction = 'auction',
  Chart = 'chart',
}

export const ViewSwitcher = ({
  topSectionView,
  setViewSection,
  children,
}: {
  topSectionView: ViewSection
  setViewSection: (view: ViewSection) => void
  children: ReactNode
}) => (
  <Flex className={auctionWrapVariants['post']}>
    <Flex w={'100%'} justify={'center'} mb={'x3'}>
      <Flex className={switcherBox}>
        {Object.values(ViewSection).map((view) => (
          <Button
            key={view}
            variant={'ghost'}
            size="md"
            pos={'relative'}
            px={'x0'}
            mr={'x3'}
            onClick={() => setViewSection(view)}
            className={
              view === topSectionView ? buttonTab['selected'] : buttonTab['unselected']
            }
          >
            {view}
          </Button>
        ))}
      </Flex>
    </Flex>
    <Flex justify={'center'}>{children}</Flex>
  </Flex>
)
