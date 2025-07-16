import { Box } from '@buildeross/zord'
import Image from 'next/legacy/image'
import React from 'react'

import { auctionImg, tokenImage } from './Auction.css'

interface AucitonImageProps {
  image?: string
  name?: string
  isLoading?: boolean
}

export const AuctionImage = ({ image, name }: AucitonImageProps) => {
  const [imgErr, setImgErr] = React.useState<boolean>(false)

  return (
    <Box
      backgroundColor="background2"
      width={'100%'}
      height={'auto'}
      aspectRatio={1 / 1}
      position="relative"
      className={tokenImage}
    >
      <Image
        priority
        unoptimized
        layout="fill"
        src={imgErr ? '/ImageError.svg' : image || ''}
        onError={() => setImgErr(true)}
        sizes="100vw"
        alt={name || ''}
        className={auctionImg}
      />
    </Box>
  )
}
