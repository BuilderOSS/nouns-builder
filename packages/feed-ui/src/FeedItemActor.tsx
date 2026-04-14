import { useEnsData } from '@buildeross/hooks/useEnsData'
import type { AddressType } from '@buildeross/types'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import React from 'react'

import { feedItemActorName } from './Feed.css'

interface FeedItemActorProps {
  address: AddressType
}

export const FeedItemActor: React.FC<FeedItemActorProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)

  return (
    <WalletIdentityWithPreview
      address={address}
      displayName={displayName}
      avatarSrc={ensAvatar}
      avatarSize="24"
      nameVariant="paragraph-sm"
      nameClassName={feedItemActorName}
      mobileTapBehavior="toggle"
    />
  )
}
