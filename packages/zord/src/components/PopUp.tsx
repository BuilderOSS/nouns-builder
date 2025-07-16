import { Atoms } from '../atoms.css'
import { Box, Button, Icon } from '../elements'
import { container } from './PopUp.css'
import { Placement } from '@popperjs/core'
import React, { useEffect, useState } from 'react'
import { usePopper } from 'react-popper'

export interface PopUpProps {
  trigger?: React.ReactNode
  children?: React.ReactNode
  wrapperClassName?: string
  close?: boolean
  open?: boolean
  offsetX?: number
  offsetY?: number
  placement?: Placement
  padding?: Atoms['padding']
  triggerClassName?: string // Add className to the trigger element, specifically
  onOpenChange?: (state: boolean) => void
}

export function PopUp({
  trigger,
  children,
  open = false,
  close = false,
  placement = 'bottom-start',
  padding = 'x4',
  offsetX = 0,
  offsetY = 8,
  triggerClassName,
  onOpenChange,
  wrapperClassName,
}: PopUpProps) {
  const [triggerElement, setTriggerElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [openState, setOpenState] = useState(open)
  const { styles, attributes } = usePopper(triggerElement, popperElement, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [offsetX, offsetY],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          rootBoundary: 'viewport',
        },
      },
    ],
  })

  useEffect(() => {
    if (typeof onOpenChange === 'function') onOpenChange(openState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openState])

  useEffect(() => {
    if (openState !== open) setOpenState(open)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (close) setOpenState(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [close])

  return (
    <>
      <Box
        onClick={() => setOpenState(!openState)}
        ref={setTriggerElement}
        className={[triggerClassName]}
      >
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            borderRadius="round"
            p="x3"
            style={{ minWidth: 0, height: 'auto' }}
          >
            <Icon id="Ellipsis" size="md" />
          </Button>
        )}
      </Box>
      {openState && (
        <>
          <Box
            backgroundColor="background1"
            borderRadius="small"
            p={padding}
            ref={setPopperElement}
            className={[wrapperClassName, container]}
            style={{ ...styles.popper, zIndex: 101 }}
            {...attributes.popper}
          >
            {children}
          </Box>
          <Box
            cursor="pointer"
            position="fixed"
            top="x0"
            left="x0"
            w="100vw"
            h="100vh"
            onClick={() => setOpenState(false)}
            style={{ zIndex: 100 }}
          />
        </>
      )}
    </>
  )
}
