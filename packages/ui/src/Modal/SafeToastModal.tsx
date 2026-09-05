import { AnimatePresence, motion } from 'framer-motion'
import React, { type ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { safeToastContainer, safeToastWrapper } from './SafeToastModal.css'

export interface SafeToastModalProps {
  children: ReactNode
  isOpen: boolean
  onClose?: () => void
}

/**
 * Toast-style modal for Safe transactions
 * Appears at top-right, 16px below nav bar, with faint backdrop
 */
export const SafeToastModal: React.FC<SafeToastModalProps> = ({
  children,
  isOpen,
  onClose: _onClose,
}) => {
  return createPortal(
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
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
            }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
