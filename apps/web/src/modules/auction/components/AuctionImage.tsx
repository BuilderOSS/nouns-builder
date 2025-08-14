import { getFetchableUrls } from '@buildeross/ipfs-service'
import { Box } from '@buildeross/zord'
import React from 'react'
import { FallbackNextLegacyImage } from 'src/components/FallbackImage'

import { auctionImg, tokenImage } from './Auction.css'

interface AucitonImageProps {
  image?: string
  name?: string
  isLoading?: boolean
}

export const AuctionImage = ({ image, name }: AucitonImageProps) => {
  const srcList = getFetchableUrls(image)

  return (
    <Box
      backgroundColor="background2"
      width={'100%'}
      height={'auto'}
      aspectRatio={1 / 1}
      position="relative"
      className={tokenImage}
    >
      <FallbackNextLegacyImage
        srcList={srcList}
        alt={name || ''}
        priority
        unoptimized
        layout="fill"
        sizes="100vw"
        className={auctionImg}
      />
    </Box>
  )
}
