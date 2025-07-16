import { Box } from '@buildeross/zord'
import NextImage from 'next/image'
import { useCallback, useRef, useState } from 'react'

import { Icon } from '../Icon'

export interface AudioProps {
  src: string
  cover?: string
}

export const Audio: React.FC<AudioProps> = ({ src, cover }) => {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
  }, [audioRef, playing])

  return (
    <Box position={'relative'} w="100%" h="100%">
      {!cover ? (
        <Box backgroundColor="background2" w="100%" h="100%" borderRadius={'curved'} />
      ) : (
        <NextImage
          src={cover}
          width={400}
          height={400}
          unoptimized
          alt="Preview"
          style={{
            objectFit: 'cover',
            borderRadius: '10px',
            height: '400px',
            width: '400px',
          }}
        />
      )}

      <Box
        as={'button'}
        onClick={togglePlay}
        borderColor="transparent"
        h="x10"
        w="x10"
        cursor={'pointer'}
        borderRadius="round"
        backgroundColor={'background1'}
        position={'absolute'}
        bottom="x4"
        right="x4"
      >
        <Icon id={playing ? 'pause' : 'play'} fill={'text2'} />
      </Box>

      <audio
        src={src}
        ref={audioRef}
        loop
        preload={'auto'}
        playsInline
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </Box>
  )
}
