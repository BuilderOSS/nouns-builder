import { Button, ButtonProps, Icon, PopUp, Text } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'

interface ShareButtonProps {
  // Full URL to copy
  url: string
  // Button size - supports responsive sizes like {'@initial': 'sm', '@768': 'md'}
  size?: ButtonProps['size']
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
  tooltip = 'Copy Share Link',
  className,
}) => {
  const [copied, setCopied] = React.useState<boolean>(false)
  const [showTooltip, setShowTooltip] = React.useState<boolean>(false)
  const triggerRef = React.useRef<HTMLDivElement | null>(null)

  const handleShare = React.useCallback(
    async (e: React.MouseEvent) => {
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

  // Get effective size for icon and padding (use @initial value if responsive, otherwise use string value)
  const effectiveSize = typeof size === 'string' ? size : size?.['@initial'] || 'md'
  const iconSize = effectiveSize === 'sm' || effectiveSize === 'xs' ? 'sm' : 'md'
  const px = effectiveSize === 'lg' ? 'x6' : effectiveSize === 'xs' ? 'x3' : 'x4'

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
