import { Box, BoxProps } from '@zoralabs/zord'
import { getFetchableUrls } from 'ipfs-service'
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

  return tokenUri?.image ? (
    <Box
      className={['zora-avatar', squareAvatar({ size, variant }), className]}
      borderColor={'border'}
      borderWidth={'thin'}
      borderStyle={'solid'}
      {...props}
    >
      <FallbackNextImage
        key={tokenUri?.name}
        srcList={getFetchableUrls(tokenUri?.image)}
        alt={collectionAddress || 'Avatar image'}
        style={{
          objectFit: 'cover',
        }}
        width={size}
        height={size}
      />
    </Box>
  ) : (
    <Box
      className={['zora-avatar', squareAvatar({ size, variant }), className]}
      style={{ background }}
      borderColor={'border'}
      borderWidth={'thin'}
      borderStyle={'solid'}
      {...props}
    >
      {src && !imageHasError && (
        <FallbackNextImage
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
