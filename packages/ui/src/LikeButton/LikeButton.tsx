import { CHAIN_ID } from '@buildeross/types'
import { ButtonProps, Icon, PopUp } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Address } from 'viem'
import { useAccount, useBalance } from 'wagmi'

import { ContractButton } from '../ContractButton'
import { LikePopupContent } from './LikePopupContent'

interface LikeButtonProps {
  coinAddress: Address
  symbol: string
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  variant?: 'ghost' | 'outline' | 'secondary' | 'primary'
  size?: ButtonProps['size']
  onLikeSuccess?: (txHash: string, amount: bigint) => void
}

const LikeButton: React.FC<LikeButtonProps> = ({
  coinAddress,
  // symbol,
  chainId,
  variant = 'ghost',
  size = 'md',
  onLikeSuccess,
}) => {
  // UI State
  const [showPopup, setShowPopup] = useState(false)
  const [justLiked, setJustLiked] = useState(false)

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const justLikedTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Wagmi hooks
  const { address: userAddress } = useAccount()

  // Get user's coin balance to determine filled heart state
  const { data: coinBalance } = useBalance({
    address: userAddress,
    token: coinAddress,
    chainId,
    query: {
      enabled: !!userAddress,
    },
  })

  // Check if user owns any of this coin (for filled heart state)
  const hasBalance = useMemo(() => {
    return coinBalance && coinBalance.value > 0n
  }, [coinBalance])

  // Handle opening popup
  const handleOpenPopup = useCallback(() => {
    setShowPopup(true)
  }, [])

  // Handle closing popup
  const handleClosePopup = useCallback(() => {
    setShowPopup(false)
  }, [])

  // Get effective size for icon and padding
  const effectiveSize = typeof size === 'string' ? size : size?.['@initial'] || 'md'
  const iconSize = effectiveSize === 'sm' || effectiveSize === 'xs' ? 'sm' : 'md'
  const px = effectiveSize === 'lg' ? 'x6' : effectiveSize === 'xs' ? 'x3' : 'x4'

  const isLiked = hasBalance || justLiked

  // Determine which heart icon to show
  const heartIcon = isLiked ? 'heartFilled' : 'heart'

  const onLikeSuccessInner = useCallback(
    (txHash: string, amount: bigint) => {
      setJustLiked(true)
      onLikeSuccess?.(txHash, amount)

      // Clear any existing timeout before creating a new one
      if (justLikedTimeoutRef.current) {
        clearTimeout(justLikedTimeoutRef.current)
      }

      justLikedTimeoutRef.current = setTimeout(() => {
        setJustLiked(false)
      }, 3000)
    },
    [onLikeSuccess]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (justLikedTimeoutRef.current) {
        clearTimeout(justLikedTimeoutRef.current)
        justLikedTimeoutRef.current = null
      }
    }
  }, [])

  return (
    <>
      <ContractButton
        ref={triggerRef}
        variant={variant}
        handleClick={handleOpenPopup}
        chainId={chainId}
        borderRadius="curved"
        size={size}
        style={{ minWidth: 'unset', opacity: 1, cursor: 'not-allowed' }}
        px={px}
        disabled={isLiked}
      >
        <motion.div
          key={heartIcon}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon id={heartIcon} size={iconSize} />
        </motion.div>
      </ContractButton>
      <PopUp
        open={showPopup}
        placement="top"
        showBackdrop={true}
        triggerRef={triggerRef.current}
        onOpenChange={(open) => {
          if (!open) handleClosePopup()
        }}
        padding="x2"
      >
        {showPopup && (
          <LikePopupContent
            coinAddress={coinAddress}
            chainId={chainId}
            onClose={handleClosePopup}
            onLikeSuccess={onLikeSuccessInner}
          />
        )}
      </PopUp>
    </>
  )
}

export default LikeButton
