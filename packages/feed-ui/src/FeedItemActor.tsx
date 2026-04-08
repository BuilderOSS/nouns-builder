import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { AddressType } from '@buildeross/types'
import { Avatar } from '@buildeross/ui/Avatar'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { walletSnippet } from '@buildeross/utils'
import { Flex, Text } from '@buildeross/zord'
import React from 'react'

import { feedItemActorName } from './Feed.css'
import { FeedWalletProfilePreview } from './FeedWalletProfilePreview'

interface FeedItemActorProps {
  address: AddressType
}

export const FeedItemActor: React.FC<FeedItemActorProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const { getProfileLink } = useLinks()

  return (
    <LinkWrapper link={getProfileLink(address)} align="center" gap="x1">
      <FeedWalletProfilePreview
        address={address}
        displayName={displayName}
        avatarSrc={ensAvatar}
      >
        <Flex align="center" gap="x1">
          <Avatar address={address} src={ensAvatar} size="24" />
          <Text className={feedItemActorName} variant="paragraph-sm">
            {displayName || walletSnippet(address)}
          </Text>
        </Flex>
      </FeedWalletProfilePreview>
    </LinkWrapper>
  )
}
