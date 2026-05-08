import { Box, Icon, PopUp } from '@buildeross/zord'
import { useRef, useState } from 'react'

export const Tooltip = ({
  children,
  label = 'Help',
}: {
  children: string
  label?: string
}) => {
  const [showTooltip, setShowTooltip] = useState(false)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <Box
        cursor="pointer"
        onMouseOver={() => setShowTooltip(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        ref={triggerRef}
        tabIndex={0}
        color="text3"
        aria-label={label}
      >
        <Icon id="question" size="sm" aria-hidden />
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
