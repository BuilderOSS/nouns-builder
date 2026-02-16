import { Button, Icon } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'

interface ShareButtonProps {
  // Full URL to copy
  url: string
  // Button size
  size?: 'sm' | 'md' | 'lg'
  // Button variant
  variant?: 'ghost' | 'outline' | 'secondary' | 'primary'
  // Optional callback when copy is successful
  onCopySuccess?: (url: string) => void
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  size = 'md',
  variant = 'ghost',
  onCopySuccess,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false)

  const handleShare = React.useCallback(async () => {
    if (copied || !url) return

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      onCopySuccess?.(url)
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }, [url, onCopySuccess, copied])

  const iconSize = size === 'sm' ? 'sm' : 'md'

  return (
    <Button
      variant={variant}
      onClick={handleShare}
      borderRadius="curved"
      style={{
        padding: size === 'sm' ? '8px' : size === 'md' ? '10px' : '12px',
        minWidth: 'unset',
      }}
    >
      {!copied ? (
        <Icon id="share" size={iconSize} />
      ) : (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          exit={{ scale: 0 }}
        >
          <Icon id="checkInCircle" size={iconSize} fill="positive" />
        </motion.div>
      )}
    </Button>
  )
}

export default ShareButton
