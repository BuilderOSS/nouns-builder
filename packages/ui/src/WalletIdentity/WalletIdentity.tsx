import { walletSnippet } from '@buildeross/utils'
import { Flex, Text } from '@buildeross/zord'
import { type ComponentProps, type CSSProperties } from 'react'

import { Avatar, type AvatarProps } from '../Avatar'

export interface WalletIdentityProps {
  address: `0x${string}`
  displayName?: string | null
  avatarSrc?: string | null
  avatarSize?: AvatarProps['size']
  nameVariant?: ComponentProps<typeof Text>['variant']
  className?: string
  nameClassName?: string
  nameStyle?: CSSProperties
  nameWeight?: ComponentProps<typeof Text>['fontWeight']
  gap?: ComponentProps<typeof Flex>['gap']
}

export const WalletIdentity = ({
  address,
  displayName,
  avatarSrc,
  avatarSize = '28',
  nameVariant = 'paragraph-md',
  className,
  nameClassName,
  nameStyle,
  nameWeight = 'display',
  gap = 'x2',
}: WalletIdentityProps) => {
  return (
    <Flex align="center" gap={gap} minWidth={0} className={className}>
      <Avatar address={address} src={avatarSrc} size={avatarSize} />
      <Text
        className={nameClassName}
        variant={nameVariant}
        fontWeight={nameWeight}
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          ...nameStyle,
        }}
      >
        {displayName || walletSnippet(address)}
      </Text>
    </Flex>
  )
}
