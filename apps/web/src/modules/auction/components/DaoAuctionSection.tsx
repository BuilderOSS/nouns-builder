import { Chain } from '@buildeross/types'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactElement } from 'react'
import { Auction, type TokenWithDao } from 'src/modules/auction/components/Auction'
import { AuctionChart } from 'src/modules/auction/components/AuctionChart/AuctionChart'
import { ViewSwitcher } from 'src/modules/auction/components/ViewSwitcher'

type TopSectionProps = {
  chain: Chain
  collection: string
  auctionAddress: string
  token: TokenWithDao
  onAuctionCreated?: (tokenId: bigint) => void
}

export enum TopSectionView {
  Auction = 'auction',
  Chart = 'chart',
}

export const DaoAuctionSection = ({
  chain,
  auctionAddress,
  collection,
  token,
  onAuctionCreated,
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
            onAuctionCreated={onAuctionCreated}
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
