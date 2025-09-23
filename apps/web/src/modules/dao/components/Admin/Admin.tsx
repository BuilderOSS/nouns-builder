import { Flex } from '@buildeross/zord'
import React from 'react'
import { useDaoStore } from 'src/stores/useDaoStore'
import { sectionWrapperStyle } from 'src/styles/dao.css'

import { AdminForm } from '../AdminForm/AdminForm'
import { AuctionRewards } from './AuctionRewards'

export const Admin: React.FC = () => {
  const addresses = useDaoStore((x) => x.addresses)

  if (!addresses.auction || !addresses.token) {
    return null
  }

  return (
    <Flex direction={'column'} className={sectionWrapperStyle['admin']} mx={'auto'}>
      <Flex direction={'column'} w={'100%'}>
        <AdminForm collectionAddress={addresses.token} />
        <AuctionRewards auctionAddress={addresses.auction} />
      </Flex>
    </Flex>
  )
}
