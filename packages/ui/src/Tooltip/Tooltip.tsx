import { Box, Icon, PopUp } from '@buildeross/zord'
import { useRef, useState } from 'react'

export const Tooltip = ({ children }: { children: string }) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <Box
        cursor="pointer"
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        ref={triggerRef}
      >
        <Icon id="info-16" size="sm" />
      </Box>
      <PopUp
        open={showTooltip}
        triggerRef={triggerRef.current}
        showBackdrop={false}
        placement="top"
      >
        <Box maxWidth="x64">{children}</Box>
      </PopUp>
    </>
  )
}
