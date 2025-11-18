import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { AddressType } from '@buildeross/types'
import { Text } from '@buildeross/zord'
import React from 'react'

import { Avatar } from '../Avatar'
import { useLinks } from '../LinksProvider'
import { LinkWrapper } from '../LinkWrapper'
import { feedItemActorName } from './Feed.css'

interface FeedItemActorProps {
  address: AddressType
}

export const FeedItemActor: React.FC<FeedItemActorProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const { getProfileLink } = useLinks()

  return (
    <LinkWrapper link={getProfileLink(address)} align="center" gap="x1">
      <Avatar address={address} src={ensAvatar} size="24" />
      <Text className={feedItemActorName} variant="paragraph-sm">
        {displayName}
      </Text>
    </LinkWrapper>
  )
}
