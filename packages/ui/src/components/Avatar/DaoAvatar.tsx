import { useDaoAuction } from '@buildeross/hooks/useDaoAuction'
import { getFetchableUrls } from '@buildeross/ipfs-service'
import { CHAIN_ID } from '@buildeross/types'
import { bgForAddress } from '@buildeross/utils/gradient'
import { Box, BoxProps } from '@buildeross/zord'
import { useEffect, useMemo, useState } from 'react'

import { avatarVariants, squareAvatar } from './Avatar.css'
import { FallbackImage } from './FallbackImage'

export interface DaoAvatarProps extends Omit<BoxProps, 'size'> {
  collectionAddress: string
  auctionAddress: string
  chainId: CHAIN_ID
  size?: keyof (typeof avatarVariants)['size']
  variant?: keyof (typeof avatarVariants)['variant']
  src?: string | null
}

export function DaoAvatar({
  collectionAddress,
  auctionAddress,
  className,
  size,
  variant,
  src,
  chainId,
  ...props
}: DaoAvatarProps) {
  const { tokenUri } = useDaoAuction({
    collectionAddress,
    auctionAddress,
    chainId,
  })

  const [imageHasError, setImageHasError] = useState(false)

  // Pass null as src to bgForAddress when image fails, so it shows gradient
  const background = useMemo(
    () => bgForAddress(collectionAddress, imageHasError ? null : src),
    [collectionAddress, src, imageHasError],
  )

  // Reset error state when src changes
  useEffect(() => {
    setImageHasError(false)
  }, [src])

  if (!tokenUri?.image && !src) {
    return (
      <Box
        className={['zora-avatar', squareAvatar({ size, variant }), className]}
        style={{ background }}
        borderColor={'border'}
        borderWidth={'thin'}
        borderStyle={'solid'}
        {...props}
      />
    )
  }

  if (src) {
    return (
      <Box
        className={['zora-avatar', squareAvatar({ size, variant }), className]}
        style={{ background }}
        borderColor={'border'}
        borderWidth={'thin'}
        borderStyle={'solid'}
        {...props}
      >
        {!imageHasError && (
          <FallbackImage
            key={src}
            srcList={getFetchableUrls(src)}
            alt={collectionAddress || 'Avatar image'}
            style={{
              objectFit: 'cover',
              width: '100%',
              height: '100%',
            }}
            width={size ? Number(size) : undefined}
            height={size ? Number(size) : undefined}
            onImageError={() => setImageHasError(true)}
          />
        )}
      </Box>
    )
  }

  return (
    <Box
      className={['zora-avatar', squareAvatar({ size, variant }), className]}
      borderColor={'border'}
      borderWidth={'thin'}
      borderStyle={'solid'}
      {...props}
    >
      {!imageHasError && (
        <FallbackImage
          key={tokenUri?.name}
          srcList={getFetchableUrls(tokenUri?.image)}
          alt={collectionAddress || 'Avatar image'}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
          }}
          width={size ? Number(size) : undefined}
          height={size ? Number(size) : undefined}
          onImageError={() => setImageHasError(true)}
        />
      )}
    </Box>
  )
}
