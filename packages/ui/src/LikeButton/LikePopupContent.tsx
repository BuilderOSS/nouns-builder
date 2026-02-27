import { NATIVE_TOKEN_ADDRESS } from '@buildeross/constants/addresses'
import { useEthUsdPrice, useExecuteSwap, useSwapOptions } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Icon, Spinner, Stack, Text } from '@buildeross/zord'
import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { type Address } from 'viem'
import { useAccount, useBalance, usePublicClient, useWalletClient } from 'wagmi'

interface LikePopupContentProps {
  coinAddress: Address
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  onClose: () => void
  onLikeSuccess?: (txHash: string, amount: bigint) => void
}

export const LikePopupContent: React.FC<LikePopupContentProps> = ({
  coinAddress,
  chainId,
  onClose,
  onLikeSuccess,
}) => {
  // Transaction state
  const [selectedAmount, setSelectedAmount] = useState<bigint | null>(null)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txSuccess, setTxSuccess] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Wagmi hooks
  const { address: userAddress } = useAccount()
  const publicClient = usePublicClient({ chainId })
  const { data: walletClient, isLoading: isLoadingWalletClient } = useWalletClient({
    chainId,
  })

  // Get user's ETH balance
  const { data: ethBalance } = useBalance({
    address: userAddress,
    chainId,
    query: {
      enabled: !!userAddress,
    },
  })

  // Fetch ETH/USD price
  const { price: ethUsdPrice, isLoading: isLoadingPrice } = useEthUsdPrice()

  // Fetch swap options (ETH -> Coin)
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

  // Execute swap hook
  const { execute } = useExecuteSwap({
    walletClient: walletClient ?? undefined,
    publicClient: publicClient ?? undefined,
  })

  // Check if user has sufficient balance
  const hasSufficientBalance = useCallback(
    (amount: bigint) => {
      if (!ethBalance) return false
      return ethBalance.value >= amount
    },
    [ethBalance]
  )

  // Determine if initial data is loading
  const isLoadingData =
    isLoadingPrice ||
    isLoadingOptions ||
    isLoadingWalletClient ||
    !ethOption ||
    presetAmounts.length === 0

  // Handle amount selection and execute swap
  const handleSelectAmount = useCallback(
    async (amount: bigint) => {
      if (!userAddress) {
        setError('Please connect your wallet')
        return
      }

      if (!ethOption) {
        setError('Swap options not available')
        return
      }

      if (!publicClient || !walletClient) {
        setError('Wallet client not ready')
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
        setIsLiking(true)
        // Execute the swap
        const hash = await execute({
          chainId,
          path: ethOption.path,
          amountIn: amount,
          amountOut: 1n, // we set a non-zero amountOut to avoid reverting the transaction
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
          // Auto-close is handled by useEffect watching txSuccess
        } else {
          setError('Transaction failed')
        }
      } catch (err: any) {
        console.error('Like transaction error:', err)
        setError('Transaction failed')
        setSelectedAmount(null)
      } finally {
        setIsLiking(false)
      }
    },
    [
      ethOption,
      userAddress,
      publicClient,
      walletClient,
      ethBalance,
      chainId,
      execute,
      onLikeSuccess,
    ]
  )

  // Auto-close on success (backup in case setTimeout doesn't work)
  useEffect(() => {
    if (txSuccess) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [txSuccess, onClose])

  // Loading state
  if (isLoadingData) {
    return (
      <Box
        p="x1"
        style={{ minWidth: '180px' }}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Flex justify="center" align="center" gap="x2">
          <Spinner size="sm" />
          <Text variant="label-sm">Loading...</Text>
        </Flex>
      </Box>
    )
  }

  // Success state
  if (txSuccess && txHash) {
    return (
      <Box
        p="x1"
        style={{ minWidth: '180px' }}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Stack gap="x2" align="center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Icon id="checkInCircle" size="md" />
          </motion.div>
          <Text variant="label-md" align="center" style={{ fontWeight: 500 }}>
            Liked!
          </Text>
        </Stack>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box
        p="x1"
        style={{ minWidth: '180px' }}
        onClick={(e: React.MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <Stack gap="x2">
          <Text variant="label-sm" color="negative" align="center">
            {error}
          </Text>
          <Button
            variant="ghost"
            size="xs"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
          >
            Close
          </Button>
        </Stack>
      </Box>
    )
  }

  // Check if wallet is ready
  const isWalletReady = !!(userAddress && publicClient && walletClient)

  // Preset selection state
  return (
    <Box
      p="x1"
      style={{ minWidth: '180px' }}
      onClick={(e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <Stack gap="x2">
        <Text variant="label-sm" align="center" style={{ fontWeight: 500 }}>
          Like with
        </Text>
        <Flex gap="x2" justify="center">
          {presetAmounts.map((preset) => {
            const isSelected = selectedAmount === preset.eth
            const isSufficientBalance = hasSufficientBalance(preset.eth)
            const isButtonDisabled =
              !isWalletReady || !isSufficientBalance || (isLiking && !isSelected)
            const isButtonLoading = isSelected && isLiking

            return (
              <Button
                key={preset.usd}
                variant={'outline'}
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (!isButtonDisabled && !isButtonLoading) {
                    handleSelectAmount(preset.eth)
                  }
                }}
                disabled={isButtonDisabled || isButtonLoading}
                style={{ flex: 1, width: '50px', minWidth: 0, maxWidth: '50px' }}
              >
                {isButtonLoading ? (
                  <Spinner size="xs" />
                ) : (
                  <Text variant="label-sm" style={{ fontWeight: 500 }}>
                    ${preset.usd < 1 ? preset.usd.toFixed(2) : preset.usd.toFixed(0)}
                  </Text>
                )}
              </Button>
            )
          })}
        </Flex>
        {!isWalletReady && (
          <Text variant="label-xs" color="tertiary" align="center">
            Connect wallet to like
          </Text>
        )}
      </Stack>
    </Box>
  )
}
