import { getFetchableUrls } from '@buildeross/ipfs-service'
import { FallbackImage } from '@buildeross/ui/FallbackImage'
import { Box } from '@buildeross/zord'

import { auctionImg, tokenImage } from './Auction.css'

interface AucitonImageProps {
  image?: string
  name?: string
  isLoading?: boolean
}

export const AuctionImage = ({ image, name }: AucitonImageProps) => {
  return (
    <Box
      backgroundColor="background2"
      width={'100%'}
      height={'auto'}
      aspectRatio={1 / 1}
      position="relative"
      className={tokenImage}
    >
      <FallbackImage
        srcList={getFetchableUrls(image)}
        className={auctionImg}
        alt={name || ''}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '12px',
        }}
      />
    </Box>
  )
}
