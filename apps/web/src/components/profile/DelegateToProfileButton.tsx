import { Button } from '@buildeross/zord'
import React from 'react'
import { isAddressEqual } from 'viem'
import { useAccount } from 'wagmi'

import { DelegateToProfileModal } from './DelegateToProfileModal'

type DelegateToProfileButtonProps = {
  profileAddress: `0x${string}`
  profileName: string
}

export const DelegateToProfileButton: React.FC<DelegateToProfileButtonProps> = ({
  profileAddress,
  profileName,
}) => {
  const { address } = useAccount()
  const [isOpen, setIsOpen] = React.useState(false)
  const isOwnProfile = !!address && isAddressEqual(address, profileAddress)

  if (isOwnProfile) return null

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        aria-label={`Delegate votes to ${profileName}`}
      >
        Delegate
      </Button>
      <DelegateToProfileModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        profileAddress={profileAddress}
        profileName={profileName}
      />
    </>
  )
}
