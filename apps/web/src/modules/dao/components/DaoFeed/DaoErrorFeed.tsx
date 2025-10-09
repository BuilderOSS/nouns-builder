import { Flex, Text } from '@buildeross/zord'
import { Fragment } from 'react'

import { GridContainer } from './DaoFeed'
import { emptyTile } from './DaoFeed.css'

export const EmptyTile = ({ displayContent }: { displayContent: boolean }) => {
  return (
    <Flex
      backgroundColor="border"
      direction="column"
      justify="center"
      align="center"
      className={emptyTile}
    >
      {displayContent && (
        <Fragment>
          <Text fontWeight="display" mb="x1">
            Error loading DAOs
          </Text>
          <Text mb="x2">Please reload the page</Text>
        </Fragment>
      )}
    </Flex>
  )
}

export const DaoErrorFeed = () => {
  return (
    <GridContainer>
      {[...Array(3)].map((_, idx) => (
        <EmptyTile key={idx} displayContent={idx === 1} />
      ))}
    </GridContainer>
  )
}
