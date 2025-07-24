import { Box } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React from 'react'
import { Icon } from 'src/components/Icon'
import { useDaoStore } from 'src/stores/useDaoStore'

import { copyButtonVariants } from './CopyButton.css'

interface CopyButtonProps {
  title?: string
  text?: string
  all?: boolean
  variant?: 'default' | 'icon'
}

const CopyButton = ({ title, text, all, variant = 'default' }: CopyButtonProps) => {
  const { addresses } = useDaoStore()
  const copy: any = {
    token: addresses?.token,
    auction: addresses?.auction,
    treasury: addresses?.treasury,
    governor: addresses?.governor,
    metadata: addresses?.metadata,
  }

  const copyAll = Object.keys(copy).reduce(
    (acc, key) => {
      return `${acc}${key}: ${copy[key as string]}\n`
    },
    title ? `${title}:\n` : `all addresses:\n`
  )

  const [copied, setCopied] = React.useState<boolean>(false)
  const handleCopy = async (text: string) => {
    if (copied) return
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 1500)
  }

  return (
    <React.Fragment>
      {!copied ? (
        <Box
          className={copyButtonVariants[variant]}
          onClick={() => handleCopy(all ? (copyAll as string) : (text as string))}
        >
          <Icon id="copy" fill="text4" />
        </Box>
      ) : (
        <Box className={copyButtonVariants[variant]}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
            exit={{ scale: 0 }}
          >
            <Icon id="checkInCircle" fill="positive" />
          </motion.div>
        </Box>
      )}
    </React.Fragment>
  )
}

export default CopyButton
