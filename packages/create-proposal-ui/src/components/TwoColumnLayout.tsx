import { Box, Grid } from '@buildeross/zord'
import { FC, ReactNode } from 'react'

import { rightColumnHiddenOnMobile, twoColumnLayout } from './TwoColumnLayout.css'

interface CustomTransactionLayoutProps {
  leftColumn?: ReactNode
  rightColumn?: ReactNode
  stickyRightColumn?: boolean
  stickyRightColumnTopOffset?: number
  hideRightColumnOnMobile?: boolean
}

export const TwoColumnLayout: FC<CustomTransactionLayoutProps> = ({
  leftColumn,
  rightColumn,
  stickyRightColumn = false,
  stickyRightColumnTopOffset = 0,
  hideRightColumnOnMobile = false,
}) => {
  return (
    <Box w={'100%'} mx={'auto'} position={'relative'}>
      <Box>
        <Grid justify={'space-between'} gap={'x16'} className={twoColumnLayout}>
          {leftColumn && <Box w={'100%'}>{leftColumn}</Box>}
          {rightColumn && (
            <Box
              w={'100%'}
              className={hideRightColumnOnMobile ? rightColumnHiddenOnMobile : undefined}
              position={stickyRightColumn ? 'sticky' : 'relative'}
              style={
                stickyRightColumn
                  ? {
                      top: `${stickyRightColumnTopOffset}px`,
                      transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    }
                  : undefined
              }
            >
              {rightColumn}
            </Box>
          )}
        </Grid>
      </Box>
    </Box>
  )
}
