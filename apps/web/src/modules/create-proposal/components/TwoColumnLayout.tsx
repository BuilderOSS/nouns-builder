import { Box, Grid } from '@buildeross/zord'
import { FC, ReactNode } from 'react'

import { twoColumnLayout } from './TwoColumnLayout.css'

interface CustomTransactionLayoutProps {
  leftColumn?: ReactNode
  rightColumn?: ReactNode
}

export const TwoColumnLayout: FC<CustomTransactionLayoutProps> = ({
  leftColumn,
  rightColumn,
}) => {
  return (
    <Box w={'100%'} mx={'auto'} position={'relative'}>
      <Box>
        <Grid justify={'space-between'} gap={'x16'} className={twoColumnLayout}>
          {leftColumn && <Box w={'100%'}>{leftColumn}</Box>}
          {rightColumn && <Box w={'100%'}>{rightColumn}</Box>}
        </Grid>
      </Box>
    </Box>
  )
}
