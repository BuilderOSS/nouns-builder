import { useEnsData } from '@buildeross/hooks/useEnsData'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { walletSnippet } from '@buildeross/utils/helpers'
import React from 'react'

interface BidderProps {
  address: string
}

export const Bidder: React.FC<BidderProps> = ({ address }) => {
  const { displayName, ensAvatar } = useEnsData(address)
  const resolvedDisplayName = displayName || walletSnippet(address as `0x${string}`)

  return (
    <WalletIdentityWithPreview
      address={address as `0x${string}`}
      displayName={resolvedDisplayName}
      avatarSrc={ensAvatar}
      avatarSize="32"
    />
  )
}
