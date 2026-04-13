import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { AddressType } from '@buildeross/types'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import React from 'react'

import { feedItemActorName } from './Feed.css'

interface FeedItemActorProps {
  address: AddressType
}

export const FeedItemActor: React.FC<FeedItemActorProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const { getProfileLink } = useLinks()

  return (
    <LinkWrapper link={getProfileLink(address)} align="center" gap="x1">
      <WalletIdentityWithPreview
        address={address}
        displayName={displayName}
        avatarSrc={ensAvatar}
        avatarSize="24"
        nameVariant="paragraph-sm"
        nameClassName={feedItemActorName}
      />
    </LinkWrapper>
  )
}
