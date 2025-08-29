import { Box, Icon } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'

import { copyButtonVariants } from './CopyButton.css'

interface CopyButtonProps {
  // Text to copy - can be string or function that returns string
  text: string | (() => string | undefined) | undefined
  // Variant styling
  variant?: 'default' | 'icon'
  // Custom icon renderers for flexibility
  renderCopyIcon?: () => React.ReactNode
  renderSuccessIcon?: () => React.ReactNode
  // Optional callback when copy is successful
  onCopySuccess?: (text: string) => void
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  variant = 'default',
  renderCopyIcon,
  renderSuccessIcon,
  onCopySuccess,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false)

  const handleCopy = React.useCallback(async () => {
    if (copied) return

    const textToCopy = (typeof text === 'function' ? text() : text) ?? ''

    if (!textToCopy) return

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      onCopySuccess?.(textToCopy)
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }, [text, onCopySuccess, copied])

  return (
    <React.Fragment>
      {!copied ? (
        <Box className={copyButtonVariants[variant]} onClick={handleCopy}>
          {renderCopyIcon ? renderCopyIcon() : <Icon id="copy" fill="text4" />}
        </Box>
      ) : (
        <Box className={copyButtonVariants[variant]}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ scale: 0 }}
          >
            {renderSuccessIcon ? (
              renderSuccessIcon()
            ) : (
              <Icon id="checkInCircle" fill="positive" />
            )}
          </motion.div>
        </Box>
      )}
    </React.Fragment>
  )
}

export default CopyButton
