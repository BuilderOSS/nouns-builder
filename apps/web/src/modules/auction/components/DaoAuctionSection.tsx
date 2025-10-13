import { AddressType, Chain } from '@buildeross/types'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactElement } from 'react'

import { Auction, type TokenWithDao } from './Auction'
import { AuctionChart } from './AuctionChart/AuctionChart'
import { ViewSection, ViewSwitcher } from './ViewSwitcher'

type TopSectionProps = {
  chain: Chain
  collection: AddressType
  auctionAddress: AddressType
  token: TokenWithDao
  onAuctionCreated?: (tokenId: bigint) => void
  referral?: AddressType
}

export const DaoAuctionSection = ({
  chain,
  auctionAddress,
  collection,
  token,
  onAuctionCreated,
  referral,
}: TopSectionProps) => {
  const [topSectionView, setViewSection] = React.useState<ViewSection>(
    ViewSection.Auction
  )

  return (
    <ViewSwitcher topSectionView={topSectionView} setViewSection={setViewSection}>
      <TabSwitchAnimation topSectionView={topSectionView}>
        {topSectionView === ViewSection.Chart ? (
          <AuctionChart />
        ) : (
          <Auction
            chain={chain}
            auctionAddress={auctionAddress}
            collection={collection}
            token={token}
            onAuctionCreated={onAuctionCreated}
            referral={referral}
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
