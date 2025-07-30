import { Box, Flex } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { Icon } from 'src/components/Icon'
import {
  animatedPanel,
  animatedPanelInner,
  panelCloseButton,
  panelProposalWrapper,
} from 'src/styles/Proposals.css'

const Panel: React.FC<{
  isOpen: boolean
  setIsOpen: (bool: boolean) => void
  close?: () => void
  children: React.ReactNode
}> = ({ isOpen, setIsOpen, close, children }) => {
  const panelVariants = {
    init: {
      y: '105%',
      transition: {
        animate: 'easeInOut',
      },
    },
    open: {
      y: 96, // height of header
      transition: {
        animate: 'easeInOut',
      },
    },
  }

  const panelRef = React.useRef(null)

  const closeCallback = React.useCallback(() => {
    if (!close) return

    close()
  }, [close])

  const handleClose = () => {
    closeCallback()
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={'init'}
          animate={isOpen ? 'open' : 'init'}
          exit={'init'}
          variants={panelVariants}
          className={animatedPanel}
          ref={panelRef}
        >
          <Flex className={animatedPanelInner}>
            <Flex p={'x8'} pt={'x24'} className={panelProposalWrapper} mx={'auto'}>
              {children}
            </Flex>
          </Flex>
          <Box
            className={panelCloseButton}
            position={'fixed'}
            right={'x8'}
            top={'x6'}
            onClick={() => handleClose()}
          >
            <Icon id="cross" />
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Panel
