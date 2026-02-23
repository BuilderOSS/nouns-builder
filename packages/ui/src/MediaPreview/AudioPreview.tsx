import { Box, Icon } from '@buildeross/zord'
import { useCallback, useRef, useState } from 'react'

export interface AudioPreviewProps {
  src: string
  /** Additional fallback URLs to try if primary src fails */
  fallbackSrcs?: string[]
  cover?: string
  /** Additional fallback URLs for cover image */
  coverFallbackSrcs?: string[]
  width?: string | number
  height?: string | number
}

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  src,
  fallbackSrcs = [],
  cover,
  coverFallbackSrcs = [],
  width = 400,
  height = 400,
}) => {
  const [playing, setPlaying] = useState(false)
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0)
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Build array of all sources with primary src first
  const allSrcs = [src, ...fallbackSrcs]
  const allCoverSrcs = cover ? [cover, ...coverFallbackSrcs] : []

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
  }, [audioRef, playing])

  const handleAudioError = () => {
    // Try next source if available
    if (currentSrcIndex < allSrcs.length - 1) {
      console.warn(
        `Audio failed to load from ${allSrcs[currentSrcIndex]}, trying next source...`
      )
      setCurrentSrcIndex(currentSrcIndex + 1)
    }
  }

  const handleCoverError = () => {
    // Try next cover source if available
    if (currentCoverIndex < allCoverSrcs.length - 1) {
      console.warn(
        `Cover image failed to load from ${allCoverSrcs[currentCoverIndex]}, trying next source...`
      )
      setCurrentCoverIndex(currentCoverIndex + 1)
    }
  }

  return (
    <Box position={'relative'} w="100%" h="100%">
      {!cover ? (
        <Box backgroundColor="background2" w="100%" h="100%" borderRadius={'curved'} />
      ) : (
        <img
          key={currentCoverIndex}
          src={allCoverSrcs[currentCoverIndex]}
          width={width}
          height={height}
          alt="Preview"
          onError={handleCoverError}
          style={{
            objectFit: 'cover',
            borderRadius: '10px',
            height: typeof height === 'number' ? `${height}px` : height,
            width: typeof width === 'number' ? `${width}px` : width,
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
        key={currentSrcIndex}
        src={allSrcs[currentSrcIndex]}
        ref={audioRef}
        loop
        preload={'auto'}
        playsInline
        onError={handleAudioError}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </Box>
  )
}
