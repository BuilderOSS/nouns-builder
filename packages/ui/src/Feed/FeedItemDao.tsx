import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { Flex, Text } from '@buildeross/zord'
import React from 'react'

import { FallbackImage } from '../FallbackImage'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemActorName } from './Feed.css'

interface FeedItemDaoProps {
  address: AddressType
  chainId: CHAIN_ID
  daoName: string
  daoImage: string
}

export const FeedItemDao: React.FC<FeedItemDaoProps> = ({
  address,
  chainId,
  daoName,
  daoImage,
}) => {
  const { getDaoLink } = useLinks()

  return (
    <LinkWrapper link={getDaoLink(chainId, address)} align="center" gap="x1">
      <Flex
        style={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <FallbackImage
          src={daoImage}
          alt={daoName}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </Flex>
      <Text className={feedItemActorName} variant="paragraph-sm">
        {daoName}
      </Text>
    </LinkWrapper>
  )
}
