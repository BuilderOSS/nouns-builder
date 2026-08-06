import { AnimatePresence, motion } from 'framer-motion'
import React, { type ReactNode, useEffect, useRef } from 'react'
import { Portal } from 'react-portal'

import { safeToastContainer, safeToastWrapper } from './SafeToastModal.css'

export interface SafeToastModalProps {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
}

/**
 * Toast-style modal for Safe transactions
 * Appears at top-right, 16px below nav bar, with no backdrop
 */
export const SafeToastModal: React.FC<SafeToastModalProps> = ({
  children,
  isOpen,
  onClose: _onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  console.log('[SafeToastModal] Rendering with isOpen:', isOpen)
  console.log('[SafeToastModal] safeToastContainer class:', safeToastContainer)

  useEffect(() => {
    if (isOpen && modalRef.current) {
      console.log('[SafeToastModal] Modal mounted in DOM')
      console.log('[SafeToastModal] Modal element:', modalRef.current)
      console.log(
        '[SafeToastModal] Modal position:',
        modalRef.current.getBoundingClientRect()
      )
      console.log(
        '[SafeToastModal] Modal computed style:',
        window.getComputedStyle(modalRef.current)
      )
      console.log('[SafeToastModal] Modal parent:', modalRef.current.parentElement)
    }
  }, [isOpen])

  return (
    <>
      <Portal>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="safe-toast-modal"
              className={safeToastWrapper}
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
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
              }}
            >
              <motion.div
                ref={modalRef}
                variants={{
                  initial: {
                    x: 50,
                    opacity: 0,
                  },
                  animate: {
                    x: 0,
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
                className={safeToastContainer}
                style={{
                  // Debug: force high visibility
                  border: '5px solid red !important',
                  backgroundColor: 'yellow !important',
                  zIndex: 99999,
                }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                }}
              >
                <div
                  style={{
                    padding: '20px',
                    color: 'black',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  DEBUG: SAFE MODAL IS HERE
                  {children}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Portal>
    </>
  )
}
