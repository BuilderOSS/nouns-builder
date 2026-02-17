import { useScrollDirection } from '@buildeross/hooks/useScrollDirection'
import { Stack } from '@buildeross/zord'
import React, { ReactNode } from 'react'

import * as styles from './StickyPreviewContainer.css'

interface StickyPreviewContainerProps {
  children: ReactNode
  align?: 'flex-start' | 'flex-end' | 'stretch' | 'center'
}

export const StickyPreviewContainer: React.FC<StickyPreviewContainerProps> = ({
  children,
  align = 'flex-start',
}) => {
  const scrollDirection = useScrollDirection()

  // Calculate top offset based on header visibility
  // Header is 80px tall and hidden when scrollDirection is 'down'
  const topOffset = scrollDirection === 'down' ? 24 : 104 // 24px + 80px header

  return (
    <div className={styles.previewContainer}>
      <Stack
        className={styles.stickyWrapper}
        style={{
          top: `${topOffset}px`,
          transition: 'top 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        align={align}
      >
        {children}
      </Stack>
    </div>
  )
}
