import { Button, Flex } from '@buildeross/zord'
import React, { ReactNode } from 'react'
import { buttonTab } from 'src/modules/dao/components/AuctionChart/AuctionChart.css'
import { TopSectionView } from 'src/modules/dao/components/DaoTopSection'

import { auctionWrapVariants, switcherBox } from './Auction.css'

export const ViewSwitcher = ({
  topSectionView,
  setTopSectionView,
  children,
}: {
  topSectionView: TopSectionView
  setTopSectionView: (view: TopSectionView) => void
  children: ReactNode
}) => (
  <Flex className={auctionWrapVariants['post']}>
    <Flex w={'100%'} justify={'center'} mb={'x3'}>
      <Flex className={switcherBox}>
        {Object.values(TopSectionView).map((view) => (
          <Button
            key={view}
            variant={'ghost'}
            size="md"
            pos={'relative'}
            px={'x0'}
            mr={'x3'}
            onClick={() => setTopSectionView(view)}
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
