import { Button, Icon, PopUp, Text } from '@buildeross/zord'
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
  // Optional label for copy tooltip
  tooltip?: string
  // Optional className
  className?: string
}

const ShareButton: React.FC<ShareButtonProps> = ({
  url,
  size = 'md',
  variant = 'ghost',
  onCopySuccess,
  tooltip = 'Copy to clipboard',
  className,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false)
  const [showTooltip, setShowTooltip] = React.useState<boolean>(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)

  const handleShare = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

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
    },
    [url, onCopySuccess, copied]
  )

  const iconSize = size === 'sm' ? 'sm' : 'md'
  const px = size === 'lg' ? 'x6' : 'x4'

  return (
    <>
      <Button
        variant={variant}
        onClick={handleShare}
        borderRadius="curved"
        size={size}
        className={className}
        style={{ minWidth: 'unset' }}
        px={px}
        onMouseOver={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        ref={triggerRef}
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
            <Icon id="checkInCircle" size={iconSize} />
          </motion.div>
        )}
      </Button>
      <PopUp
        open={showTooltip}
        placement="top"
        showBackdrop={false}
        triggerRef={triggerRef.current}
      >
        <Text align="center">{copied ? 'Copied!' : tooltip}</Text>
      </PopUp>
    </>
  )
}

export default ShareButton
