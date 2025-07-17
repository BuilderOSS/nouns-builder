import { Chain } from '@buildeross/types'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactElement } from 'react'

import { Auction } from 'src/modules/auction'
import { ViewSwitcher } from 'src/modules/auction/components/ViewSwitcher'
import { AuctionChart } from 'src/modules/dao/components/AuctionChart/AuctionChart'
import { TokenWithDao } from 'src/pages/dao/[network]/[token]/[tokenId]'

type TopSectionProps = {
  chain: Chain
  collection: string
  auctionAddress: string
  token: TokenWithDao
}

export enum TopSectionView {
  Auction = 'auction',
  Chart = 'chart',
}

export const DaoTopSection = ({
  chain,
  auctionAddress,
  collection,
  token,
}: TopSectionProps) => {
  const [topSectionView, setTopSectionView] = React.useState<TopSectionView>(
    TopSectionView.Auction
  )

  return (
    <ViewSwitcher topSectionView={topSectionView} setTopSectionView={setTopSectionView}>
      <TabSwitchAnimation topSectionView={topSectionView}>
        {topSectionView === TopSectionView.Chart ? (
          <AuctionChart />
        ) : (
          <Auction
            chain={chain}
            auctionAddress={auctionAddress}
            collection={collection}
            token={token}
          />
        )}
      </TabSwitchAnimation>
    </ViewSwitcher>
  )
}

const TabSwitchAnimation = ({
  children,
  topSectionView,
}: {
  children: ReactElement
  topSectionView: string
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
        key={topSectionView}
        variants={{
          closed: {
            opacity: 0,
          },
          open: {
            opacity: 1,
          },
        }}
        initial="closed"
        animate="open"
        exit="closed"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
