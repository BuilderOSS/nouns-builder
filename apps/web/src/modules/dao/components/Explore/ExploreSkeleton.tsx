import { Box, Grid } from '@buildeross/zord'

import { exploreGrid, exploreSkeleton } from './Explore.css'

export const ExploreSkeleton = () => {
  return (
    <Grid className={exploreGrid} mb="x6" h="100%">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Box
            key={i}
            borderRadius="curved"
            backgroundColor="background2"
            width={'100%'}
            aspectRatio={1 / 1}
            position="relative"
            className={exploreSkeleton}
          />
        ))}
    </Grid>
  )
}
