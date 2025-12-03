import { Box, Flex, Stack } from '@buildeross/zord'
import React from 'react'

import { feedItemCard } from './Feed.css'
import {
  skeletonBox,
  skeletonCircle,
  skeletonContentHorizontal,
  skeletonImage,
  skeletonPulse,
} from './FeedSkeleton.css'

interface FeedSkeletonProps {
  count?: number
}

export const ImageSkeleton: React.FC = () => {
  return <Box className={`${skeletonBox} ${skeletonPulse} ${skeletonImage}`} />
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

        {/* Content - horizontal on desktop, vertical on mobile */}
        <Stack gap="x3" w="100%" className={skeletonContentHorizontal}>
          {/* Image - full-width on mobile, fixed width on desktop */}
          <ImageSkeleton />

          {/* Content - below image on mobile, to the right on desktop */}
          <Stack gap="x2" style={{ flex: 1 }}>
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
        </Stack>

        {/* Actions section */}
        <Flex gap="x2" align="center" wrap="wrap">
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: 80, height: 32, borderRadius: '8px' }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: 100, height: 32, borderRadius: '8px' }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: 100, height: 32, borderRadius: '8px' }}
          />
        </Flex>

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
