import { Flex } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React, { ReactElement } from 'react'
import { Portal } from 'react-portal'

import { animatedModal, animatedModalContent, animatedModalTrigger } from './Modal.css'

export interface AnimatedModalProps {
  children: ReactElement
  open?: boolean
  close?: (() => void) | boolean
  size?: 'small' | 'medium' | 'large' | 'auto'
  trigger?: ReactElement<any>
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  children,
  open,
  close,
  size = 'small',
  trigger,
}) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const handleClose = React.useCallback(() => {
    if (close && typeof close === 'function') {
      close()
    }
    setIsOpen(false)
  }, [close])

  React.useEffect(() => {
    if (typeof close === 'boolean' && close) {
      handleClose()
    }
  }, [close, handleClose])

  return (
    <>
      {trigger &&
        React.cloneElement(trigger, {
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation()
            setIsOpen(true)
          },
          className: animatedModalTrigger,
          ...trigger.props,
        })}
      <Portal>
        <AnimatePresence>
          {(isOpen || open) && (
            <motion.div
              variants={{
                initial: {
                  opacity: 0,
                },
                animate: {
                  opacity: 1,
                },
              }}
              initial={'initial'}
              animate={'animate'}
              exit={'initial'}
              className={animatedModal}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                handleClose()
              }}
            >
              <motion.div
                variants={{
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
                }}
                initial={'initial'}
                animate={'animate'}
                exit={'initial'}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                }}
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
