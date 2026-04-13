import { type ComponentProps } from 'react'

import { type AvatarProps } from '../Avatar'
import { WalletProfilePreview } from '../WalletProfilePreview'
import { WalletIdentity } from './WalletIdentity'

export interface WalletIdentityWithPreviewProps {
  address: `0x${string}`
  displayName?: string | null
  avatarSrc?: string | null
  avatarSize?: AvatarProps['size']
  className?: ComponentProps<typeof WalletIdentity>['className']
  nameVariant?: ComponentProps<typeof WalletIdentity>['nameVariant']
  nameClassName?: string
  nameStyle?: ComponentProps<typeof WalletIdentity>['nameStyle']
  nameWeight?: ComponentProps<typeof WalletIdentity>['nameWeight']
  gap?: ComponentProps<typeof WalletIdentity>['gap']
  inline?: boolean
  mobileTapBehavior?: 'passthrough' | 'toggle'
}

export const WalletIdentityWithPreview = ({
  address,
  displayName,
  avatarSrc,
  avatarSize,
  className,
  nameVariant,
  nameClassName,
  nameStyle,
  nameWeight,
  gap,
  inline = false,
  mobileTapBehavior = 'passthrough',
}: WalletIdentityWithPreviewProps) => {
  return (
    <WalletProfilePreview
      address={address}
      displayName={displayName || undefined}
      avatarSrc={avatarSrc}
      inline={inline}
      mobileTapBehavior={mobileTapBehavior}
    >
      <WalletIdentity
        address={address}
        displayName={displayName}
        avatarSrc={avatarSrc}
        avatarSize={avatarSize}
        className={className}
        nameVariant={nameVariant}
        nameClassName={nameClassName}
        nameStyle={nameStyle}
        nameWeight={nameWeight}
        gap={gap}
      />
    </WalletProfilePreview>
  )
}
