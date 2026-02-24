import { Box, Icon } from '@buildeross/zord'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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

const EMPTY_SRCS: string[] = []

export const AudioPreview: React.FC<AudioPreviewProps> = ({
  src,
  fallbackSrcs = EMPTY_SRCS,
  cover,
  coverFallbackSrcs = EMPTY_SRCS,
  width = 400,
  height = 400,
}) => {
  const [playing, setPlaying] = useState(false)
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0)
  const [currentCoverIndex, setCurrentCoverIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Create stable keys for source changes to prevent unnecessary re-renders
  const audioSourcesKey = useMemo(
    () => JSON.stringify([src, ...fallbackSrcs]),
    [src, fallbackSrcs]
  )

  const coverSourcesKey = useMemo(
    () => JSON.stringify([cover, ...coverFallbackSrcs]),
    [cover, coverFallbackSrcs]
  )

  // Build array of all sources with primary src first
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allSrcs = useMemo(() => [src, ...fallbackSrcs], [audioSourcesKey])
  const allCoverSrcs = useMemo(
    () => (cover ? [cover, ...coverFallbackSrcs] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coverSourcesKey]
  )

  // Reset index when sources change
  useEffect(() => {
    setCurrentSrcIndex(0)
  }, [audioSourcesKey])

  useEffect(() => {
    setCurrentCoverIndex(0)
  }, [coverSourcesKey])

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return
    if (playing) audioRef.current.pause()
    else audioRef.current.play()
  }, [audioRef, playing])

  const handleAudioError = () => {
    // Try next source if available
    setCurrentSrcIndex((prev) => {
      if (prev < allSrcs.length - 1) {
        console.warn(`Audio failed to load from ${allSrcs[prev]}, trying next source...`)
        return prev + 1
      }
      return prev
    })
  }

  const handleCoverError = () => {
    // Try next cover source if available
    setCurrentCoverIndex((prev) => {
      if (prev < allCoverSrcs.length - 1) {
        console.warn(
          `Cover image failed to load from ${allCoverSrcs[prev]}, trying next source...`
        )
        return prev + 1
      }
      return prev
    })
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
        controls
        onError={handleAudioError}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
    </Box>
  )
}
