import { PROFILE_LINK_EAS_CHAIN_ID } from '@buildeross/constants'
import { useAuthStore } from '@buildeross/stores'
import type { AddressType } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import React from 'react'
import { isOwnProfileAddress } from 'src/utils/profileDashboard'
import type { ProfileIdentity } from 'src/utils/profileIdentity'

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
  const { address } = useAuthStore()
  const [isOpen, setIsOpen] = React.useState(false)
  const isOwnProfile = isOwnProfileAddress(address, profileAddress)

  if (!isOwnProfile) return null

  return (
    <>
      <ContractButton
        size="sm"
        variant="outline"
        handleClick={() => setIsOpen(true)}
        chainId={PROFILE_LINK_EAS_CHAIN_ID}
        aria-label="Edit profile links"
      >
        Edit links
      </ContractButton>
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
