import { getFetchableUrls } from '@buildeross/ipfs-service'
import { Box, BoxProps } from '@buildeross/zord'
import { useEffect, useMemo, useState } from 'react'

import { FallbackNextImage } from 'src/components/FallbackImage'
import { useDaoFeedCard } from 'src/modules/dao'
import { CHAIN_ID } from 'src/typings'
import { bgForAddress } from 'src/utils/gradient'

import { avatarVariants, squareAvatar } from './Avatar.css'

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
  const { tokenUri } = useDaoFeedCard({
    collectionAddress,
    auctionAddress,
    chainId,
  })

  const [imageHasError, setImageHasError] = useState(false)

  // Pass null as src to bgForAddress when image fails, so it shows gradient
  const background = useMemo(
    () => bgForAddress(collectionAddress, imageHasError ? null : src),
    [collectionAddress, src, imageHasError]
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
          <FallbackNextImage
            priority
            unoptimized
            fill
            key={src}
            srcList={getFetchableUrls(src)}
            alt={collectionAddress || 'Avatar image'}
            style={{
              objectFit: 'cover',
            }}
            width={size}
            height={size}
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
        <FallbackNextImage
          priority
          unoptimized
          fill
          key={tokenUri?.name}
          srcList={getFetchableUrls(tokenUri?.image)}
          alt={collectionAddress || 'Avatar image'}
          style={{
            objectFit: 'cover',
          }}
          width={size}
          height={size}
          onImageError={() => setImageHasError(true)}
        />
      )}
    </Box>
  )
}
