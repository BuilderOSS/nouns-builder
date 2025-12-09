import { Box, Stack } from '@buildeross/zord'
import React from 'react'

export interface MobileProfileViewProps {
  sidebarContent: React.ReactNode
}

export const MobileProfileView: React.FC<MobileProfileViewProps> = ({
  sidebarContent,
}) => {
  return (
    <Box p="x4">
      <Stack gap="x4">{sidebarContent}</Stack>
    </Box>
  )
}
