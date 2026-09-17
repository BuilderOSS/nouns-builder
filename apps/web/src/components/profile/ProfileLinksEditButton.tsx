import type { AddressType } from '@buildeross/types'
import { Button } from '@buildeross/zord'
import React from 'react'
import { isOwnProfileAddress } from 'src/utils/profileDashboard'
import type { ProfileIdentity } from 'src/utils/profileIdentity'
import { useAccount } from 'wagmi'

import { ProfileLinksEditModal } from './ProfileLinksEditModal'

type ProfileLinksEditButtonProps = {
  identity?: ProfileIdentity
  profileAddress: AddressType
  onSaved?: () => void
}

export const ProfileLinksEditButton: React.FC<ProfileLinksEditButtonProps> = ({
  identity,
  profileAddress,
  onSaved,
}) => {
  const { address } = useAccount()
  const [isOpen, setIsOpen] = React.useState(false)
  const isOwnProfile = isOwnProfileAddress(address, profileAddress)

  if (!isOwnProfile) return null

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        aria-label="Edit profile links"
      >
        Edit links
      </Button>
      <ProfileLinksEditModal
        identity={identity}
        profileAddress={profileAddress}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onSaved={onSaved}
      />
    </>
  )
}
