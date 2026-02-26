import { NATIVE_TOKEN_ADDRESS } from '@buildeross/constants/addresses'
import {
  useEthUsdPrice,
  useExecuteSwap,
  useSwapOptions,
  useSwapQuote,
} from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { Button, ButtonProps, Icon, PopUp } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { type Address } from 'viem'
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi'

import LikePopupContent from './LikePopupContent'

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
  const [selectedAmount, setSelectedAmount] = useState<bigint | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const triggerRef = useRef<HTMLDivElement | null>(null)

  // Wagmi hooks
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient } = useWalletClient({ chainId })

  // Get user's ETH balance - only fetch when popup is open
  const { data: ethBalance } = useBalance({
    address: userAddress,
    chainId,
    query: {
      enabled: showPopup && !!userAddress,
    },
  })

  // Get user's coin balance to determine filled heart state - only fetch when popup is open
  const { data: coinBalance } = useBalance({
    address: userAddress,
    token: coinAddress,
    chainId,
    query: {
      enabled: showPopup && !!userAddress,
    },
  })

  // Check if user owns any of this coin (for filled heart state)
  const hasBalance = useMemo(() => {
    return coinBalance && coinBalance.value > 0n
  }, [coinBalance])

  // Fetch ETH/USD price - only when popup is open
  const { price: ethUsdPrice, isLoading: isLoadingPrice } = useEthUsdPrice()

  // Fetch swap options (ETH -> Coin) - only when popup is open
  const { options: swapOptions, isLoading: isLoadingOptions } = useSwapOptions(
    chainId,
    coinAddress,
    true // isBuying
  )

  // Find the ETH payment option
  const ethOption = useMemo(() => {
    return swapOptions.find((opt) => opt.token.address === NATIVE_TOKEN_ADDRESS)
  }, [swapOptions])

  // Calculate preset amounts based on ETH/USD price
  const presetAmounts = useMemo(() => {
    if (!ethUsdPrice) return []

    const usdAmounts = [0.01, 0.1, 1.0] // $0.01, $0.10, $1.00
    return usdAmounts.map((usd) => ({
      usd,
      eth: BigInt(Math.floor((usd / ethUsdPrice) * 1e18)),
    }))
  }, [ethUsdPrice])

  // Get quote for selected amount - only when amount is selected
  const { amountOut, isLoading: isLoadingQuote } = useSwapQuote({
    chainId,
    path: ethOption?.path,
    amountIn: selectedAmount ?? undefined,
    slippage: 0.01, // 1%
    enabled: !!selectedAmount && !!ethOption?.path,
  })

  // Execute swap hook
  const { execute, isExecuting } = useExecuteSwap({
    walletClient: walletClient ?? undefined,
    publicClient: publicClient ?? undefined,
  })

  // Determine if data is loading
  const isLoadingData =
    showPopup &&
    (isLoadingPrice || isLoadingOptions || !ethOption || presetAmounts.length === 0)

  // Handle opening popup
  const handleOpenPopup = useCallback(() => {
    setShowPopup(true)
    setError(null)
    setTxSuccess(false)
    setTxHash(null)
    setSelectedAmount(null)
  }, [])

  // Handle closing popup
  const handleClosePopup = useCallback(() => {
    setShowPopup(false)
    setError(null)
    setTxSuccess(false)
    setTxHash(null)
    setSelectedAmount(null)
  }, [])

  // Handle amount selection and execute swap
  const handleSelectAmount = useCallback(
    async (amount: bigint) => {
      if (!ethOption || !userAddress || !publicClient || !walletClient) {
        setError('Wallet not connected')
        return
      }

      // Check balance
      if (!ethBalance || ethBalance.value < amount) {
        setError('Insufficient ETH balance')
        return
      }

      setSelectedAmount(amount)
      setError(null)

      try {
        // Wait briefly for quote to load if needed
        if (isLoadingQuote) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }

        // Execute the swap
        const hash = await execute({
          chainId,
          path: ethOption.path,
          amountIn: amount,
          amountOut: amountOut ?? 0n,
          slippage: 0.01,
        })

        setTxHash(hash)

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({
          hash,
          confirmations: 1,
        })

        if (receipt.status === 'success') {
          setTxSuccess(true)
          onLikeSuccess?.(hash, amount)

          // Auto-close after 2 seconds
          setTimeout(() => {
            handleClosePopup()
          }, 2000)
        } else {
          setError('Transaction failed')
        }
      } catch (err: any) {
        console.error('Like transaction error:', err)
        setError(err?.message || 'Transaction failed')
        setSelectedAmount(null)
      }
    },
    [
      ethOption,
      userAddress,
      publicClient,
      walletClient,
      ethBalance,
      chainId,
      amountOut,
      execute,
      onLikeSuccess,
      handleClosePopup,
      isLoadingQuote,
    ]
  )

  // Auto-close on success (backup in case setTimeout doesn't work)
  useEffect(() => {
    if (txSuccess && showPopup) {
      const timer = setTimeout(() => {
        handleClosePopup()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [txSuccess, showPopup, handleClosePopup])

  // Get effective size for icon and padding
  const effectiveSize = typeof size === 'string' ? size : size?.['@initial'] || 'md'
  const iconSize = effectiveSize === 'sm' || effectiveSize === 'xs' ? 'sm' : 'md'
  const px = effectiveSize === 'lg' ? 'x6' : effectiveSize === 'xs' ? 'x3' : 'x4'

  // Determine which heart icon to show
  const heartIcon = hasBalance ? 'heartFilled' : 'heart'

  return (
    <>
      <Button
        variant={variant}
        onClick={handleOpenPopup}
        borderRadius="curved"
        size={size}
        style={{ minWidth: 'unset' }}
        px={px}
        ref={triggerRef}
      >
        <motion.div
          key={heartIcon}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon id={heartIcon} size={iconSize} />
        </motion.div>
      </Button>
      <PopUp
        open={showPopup}
        placement="bottom"
        showBackdrop={true}
        triggerRef={triggerRef.current}
        onOpenChange={(open) => {
          if (!open) handleClosePopup()
        }}
      >
        <LikePopupContent
          isLoadingData={isLoadingData}
          presetAmounts={presetAmounts}
          isExecuting={isExecuting}
          selectedAmount={selectedAmount}
          txSuccess={txSuccess}
          txHash={txHash}
          chainId={chainId}
          error={error}
          userBalance={ethBalance?.value}
          onSelectAmount={handleSelectAmount}
          onClose={handleClosePopup}
        />
      </PopUp>
    </>
  )
}

export default LikeButton
