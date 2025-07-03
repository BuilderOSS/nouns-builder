import { Box, BoxProps } from '@zoralabs/zord'
import { getFetchableUrls } from 'ipfs-service'
import { useEffect, useMemo, useState } from 'react'

import { FallbackImage } from 'src/components/FallbackImage'
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
  const [imageHasError, setImageHasError] = useState(false)

  // Pass null as src to bgForAddress when image fails, so it shows gradient
  const background = useMemo(
    () => bgForAddress(address, imageHasError ? null : src),
    [address, src, imageHasError]
  )

  // Reset error state when src changes
  useEffect(() => {
    setImageHasError(false)
  }, [src])

  return (
    <Box
      className={['zora-avatar', avatar({ size, variant }), className]}
      style={{ background }}
      {...props}
    >
      {src && !imageHasError && (
        <FallbackImage
          key={src}
          srcList={getFetchableUrls(src)}
          alt={address || 'Avatar image'}
          style={{
            objectFit: 'cover',
          }}
          width={size ? Number(size) : undefined}
          height={size ? Number(size) : undefined}
          onImageError={() => setImageHasError(true)}
        />
      )}
    </Box>
  )
}
