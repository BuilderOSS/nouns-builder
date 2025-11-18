import { Box, Flex, Stack } from '@buildeross/zord'
import React from 'react'

import { feedItemCard } from './Feed.css'
import { skeletonBox, skeletonCircle, skeletonPulse } from './FeedSkeleton.css'

interface FeedSkeletonProps {
  count?: number
}

export const ImageSkeleton: React.FC = () => {
  return (
    <Box
      className={`${skeletonBox} ${skeletonPulse}`}
      style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: '12px' }}
    />
  )
}

export const FeedSkeletonItem: React.FC = () => {
  return (
    <Flex className={feedItemCard}>
      <Stack gap="x3" w="100%">
        {/* Top row: Avatars */}
        <Flex gap="x2" align="center">
          <Box
            className={`${skeletonCircle} ${skeletonPulse}`}
            style={{ width: 24, height: 24 }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: 60, height: 14 }}
          />
        </Flex>

        {/* Full-width image */}
        <ImageSkeleton />

        {/* Content below image */}
        <Stack gap="x2">
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: '50%', height: 20 }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: '70%', height: 18 }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: '40%', height: 16 }}
          />
        </Stack>

        {/* Actions section (future)
        <Flex
          gap="x4"
          align="center"
          pt="x2"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: 60, height: 16 }}
          />
        </Flex> */}

        {/* Bottom row: Chain and timestamp */}
        <Flex gap="x2" align="center" w="100%" justify="flex-end">
          <Box
            className={`${skeletonCircle} ${skeletonPulse}`}
            style={{ width: 24, height: 24 }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: 60, height: 14 }}
          />
        </Flex>
      </Stack>
    </Flex>
  )
}

export const FeedSkeleton: React.FC<FeedSkeletonProps> = ({ count = 5 }) => {
  return (
    <Stack gap="x4" w="100%">
      {Array.from({ length: count }).map((_, index) => (
        <FeedSkeletonItem key={index} />
      ))}
    </Stack>
  )
}
