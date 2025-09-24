import { Box, Text } from '@buildeross/zord'
import Image from 'next/image'
import { useState } from 'react'

export interface TokenPreviewProps {
  image?: string | null
  name?: string | null
}

export const TokenPreview: React.FC<TokenPreviewProps> = ({ image, name }) => {
  const [imgErr, setImgErr] = useState(false)

  return (
    <Box>
      <Box
        backgroundColor="background2"
        width={'100%'}
        height={'auto'}
        aspectRatio={1 / 1}
        position="relative"
        borderRadius="curved"
        overflow="hidden"
      >
        <Image
          priority
          layout="fill"
          src={imgErr ? '/ImageError.svg' : image || ''}
          onError={() => setImgErr(true)}
          sizes="100vw"
          alt={name || ''}
        />
      </Box>
      <Text variant="heading-xs" mt="x4">
        {name}
      </Text>
    </Box>
  )
}
