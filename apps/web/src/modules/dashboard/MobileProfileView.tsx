import { Stack } from '@buildeross/zord'
import React from 'react'

import { mobileProfileContainer } from './MobileProfileView.css'

export interface MobileProfileViewProps {
  sidebarContent: React.ReactNode
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  sidebarContent,
}) => {
  return (
    <div className={mobileProfileContainer}>
      <Stack gap="x4">{sidebarContent}</Stack>
    </div>
  )
}
