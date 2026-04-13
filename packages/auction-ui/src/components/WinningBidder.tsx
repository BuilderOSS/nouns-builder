import { useEnsData } from '@buildeross/hooks/useEnsData'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { zeroAddress } from 'viem'

import { AuctionDetail } from './AuctionDetail'

export const WinningBidder = ({ owner }: { owner?: string }) => {
  const { displayName, ensAvatar } = useEnsData(owner)

  return (
    <AuctionDetail title="Held by">
      {!owner || owner === zeroAddress ? (
        'n/a'
      ) : (
        <WalletIdentityWithPreview
          address={owner as `0x${string}`}
          displayName={displayName}
          avatarSrc={ensAvatar}
          avatarSize="24"
        />
      )}
    </AuctionDetail>
  )
}
