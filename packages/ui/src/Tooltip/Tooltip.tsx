import { Box, Icon, PopUp } from '@buildeross/zord'
import React, { useState } from 'react'

export const Tooltip = ({ children }: { children: string }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const zIndex = showTooltip ? 102 : undefined

  return (
    <>
      <Box
        cursor="pointer"
        style={{ zIndex }}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Icon id="info-16" size="sm" />
      </Box>
      <PopUp open={showTooltip} trigger={<></>}>
        <Box maxWidth="x64">{children}</Box>
      </PopUp>
    </>
  )
}
