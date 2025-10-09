import { Flex } from '@buildeross/zord'
import React from 'react'
import { useDaoStore } from 'src/stores'
import { sectionWrapperStyle } from 'src/styles/dao.css'

import { AdminForm } from '../AdminForm/AdminForm'
import { AuctionRewards } from './AuctionRewards'

export type AdminProps = {
  onOpenProposalReview: () => void
}

export const Admin: React.FC<AdminProps> = ({ onOpenProposalReview }) => {
  const addresses = useDaoStore((x) => x.addresses)

  if (!addresses?.auction || !addresses?.token) {
    return null
  }

  return (
    <Flex direction={'column'} className={sectionWrapperStyle['admin']} mx={'auto'}>
      <Flex direction={'column'} w={'100%'}>
        <AdminForm onOpenProposalReview={onOpenProposalReview} />
        <AuctionRewards auctionAddress={addresses.auction} />
      </Flex>
    </Flex>
  )
}
