import { Box } from '@buildeross/zord'

import { GridContainer } from './DaoFeed'
import { exploreSkeleton } from './DaoFeed.css'

export const DaoFeedCardSkeleton = () => {
  return (
    <Box
      borderRadius="curved"
      backgroundColor="background2"
      width={'100%'}
      aspectRatio={1}
      position="relative"
      className={exploreSkeleton}
    />
  )
}

export const DaoFeedSkeleton = () => {
  return (
    <GridContainer>
      {[...Array(3)].map((_, idx) => (
        <DaoFeedCardSkeleton key={idx} />
      ))}
    </GridContainer>
  )
}
