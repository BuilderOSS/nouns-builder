import { Flex } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactElement } from 'react'
import { Portal } from 'react-portal'

import { animatedModal, animatedModalContent, animatedModalTrigger } from './Modal.css'

interface AnimatedModalProps {
  children: ReactElement
  open?: boolean
  close?: any
  size?: 'small' | 'medium' | 'large' | 'auto'
  trigger?: ReactElement<any>
}

const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  open,
  close,
  size = 'small',
  trigger,
}) => {
  const contentVariants = {
    initial: {
      y: 50,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        delay: 0.5,
        ease: 'easeInOut',
      },
    },
  }

  const wrapperVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
  }

  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const handleClose = React.useCallback(() => {
    close && typeof close === 'function' && close()
    setIsOpen(false)
  }, [close])

  React.useEffect(() => {
    if (typeof close === 'boolean') {
      if (close) {
        handleClose()
      }
    }
  }, [close, handleClose])

  return (
    <>
      {trigger &&
        React.cloneElement(trigger, {
          onClick: () => {
            setIsOpen(true)
          },
          className: animatedModalTrigger,
          ...trigger.props,
        })}
      <Portal>
        <AnimatePresence>
          {(isOpen || open) && (
            <motion.div
              variants={wrapperVariants}
              initial={'initial'}
              animate={'animate'}
              exit={'initial'}
              className={animatedModal}
              onClick={() => handleClose()}
            >
              <motion.div
                variants={contentVariants}
                initial={'initial'}
                animate={'animate'}
                exit={'initial'}
                onClick={(e) => e.stopPropagation()}
              >
                <Flex
                  direction={'column'}
                  overflowY={'auto'}
                  className={animatedModalContent[size]}
                  center
                  mx={'auto'}
                >
                  {children}
                </Flex>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
}
export default AnimatedModal
