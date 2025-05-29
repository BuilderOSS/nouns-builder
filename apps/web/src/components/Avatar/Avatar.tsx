import { Box, BoxProps } from '@zoralabs/zord'
import { useMemo } from 'react'

import { bgForAddress } from 'src/utils/gradient'

import { avatar, avatarVariants } from './Avatar.css'

export interface AvatarProps extends Omit<BoxProps, 'size'> {
  address?: string
  size?: keyof (typeof avatarVariants)['size']
  variant?: keyof (typeof avatarVariants)['variant']
  src?: string | null
}

export function Avatar({
  address,
  className,
  size,
  variant,
  src,
  ...props
}: AvatarProps) {
  const background = useMemo(() => bgForAddress(address, src), [address, src])

  return (
    <Box
      className={['zora-avatar', avatar({ size, variant }), className]}
      style={{ background }}
      {...props}
    >
      {src && (
        <img
          key={src}
          src={src}
          alt={address || 'Avatar image'}
          style={{
            objectFit: 'cover',
          }}
          width={size}
          height={size}
        />
      )}
    </Box>
  )
}
