import { Box, Grid } from '@buildeross/zord'
import React from 'react'

import {
  exploreGrid,
  exploreSkeleton,
  skeletonDesktopOnly,
  skeletonTabletAndUp,
} from './Explore.css'

const createSkeleton = (className?: string, key?: string) => (
  <Box
    key={key}
    borderRadius="curved"
    backgroundColor="background2"
    width={'100%'}
    aspectRatio={1 / 1}
    position="relative"
    className={className ? `${exploreSkeleton} ${className}` : exploreSkeleton}
  />
)

export const ExploreSkeleton = () => {
  return (
    <Grid className={exploreGrid} mb="x6" h="100%">
      {/* Always visible skeletons (2 for mobile, 4 for tablet, 6 for desktop) */}
      {createSkeleton(undefined, 'skeleton-1')}
      {createSkeleton(undefined, 'skeleton-2')}

      {/* Hidden on mobile (600px and below) */}
      {createSkeleton(skeletonTabletAndUp, 'skeleton-3')}
      {createSkeleton(skeletonTabletAndUp, 'skeleton-4')}

      {/* Hidden on mobile and tablet (1023px and below) */}
      {createSkeleton(skeletonDesktopOnly, 'skeleton-5')}
      {createSkeleton(skeletonDesktopOnly, 'skeleton-6')}
    </Grid>
  )
}
