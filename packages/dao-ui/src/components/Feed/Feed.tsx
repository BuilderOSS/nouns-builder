import { useChainStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import { Feed as UIFeed } from '@buildeross/ui/Feed'
import React from 'react'

import { FeedTab } from './FeedTab'

type FeedTabProps = {
  collectionAddress: AddressType
}

export const Feed: React.FC<FeedTabProps> = ({ collectionAddress }) => {
  const chain = useChainStore((x) => x.chain)

  return (
    <FeedTab>
      <UIFeed chainId={chain.id} daoAddress={collectionAddress} />
    </FeedTab>
  )
}
