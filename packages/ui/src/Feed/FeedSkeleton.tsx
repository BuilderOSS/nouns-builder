import { Box, Flex, Stack } from '@buildeross/zord'
import React from 'react'

import { feedItemCard } from './Feed.css'
import { skeletonBox, skeletonCircle, skeletonPulse } from './FeedSkeleton.css'

interface FeedSkeletonProps {
  count?: number
}

const FeedSkeletonItem: React.FC = () => {
  return (
    <Flex className={feedItemCard}>
      <Flex gap="x4" w="100%">
        <Box className={`${skeletonCircle} ${skeletonPulse}`} />

        <Stack gap="x3" style={{ flex: 1, minWidth: 0 }}>
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: '60%', height: 24 }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: '80%', height: 20 }}
          />
          <Box
            className={`${skeletonBox} ${skeletonPulse}`}
            style={{ width: '40%', height: 16 }}
          />

          <Flex justify="space-between" align="center" mt="x2" gap="x4">
            <Flex align="center" gap="x2">
              <Box
                className={`${skeletonCircle} ${skeletonPulse}`}
                style={{ width: 24, height: 24 }}
              />
              <Box
                className={`${skeletonBox} ${skeletonPulse}`}
                style={{ width: 80, height: 16 }}
              />
            </Flex>
            <Box
              className={`${skeletonBox} ${skeletonPulse}`}
              style={{ width: 60, height: 14 }}
            />
          </Flex>
        </Stack>
      </Flex>
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
