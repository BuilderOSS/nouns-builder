import { Box, Icon, PopUp } from '@buildeross/zord'
import { useRef, useState } from 'react'

type PopUpProps = React.ComponentProps<typeof PopUp>
type Placement = PopUpProps['placement']

export const Tooltip = ({
  children,
  label = 'Help',
  placement = 'top',
}: {
  children: string
  label?: string
  placement?: Placement
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
        placement={placement}
      >
        <Box maxWidth="x64">{children}</Box>
      </PopUp>
    </>
  )
}
