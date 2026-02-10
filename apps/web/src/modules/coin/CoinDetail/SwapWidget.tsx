import { WETH_ADDRESS } from '@buildeross/constants/addresses'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useExecuteSwap, useSwapPath, useSwapQuote } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { truncateHex } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Input, Text } from '@buildeross/zord'
import { useState } from 'react'
import { Address, erc20Abi, formatEther, parseEther } from 'viem'
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from 'wagmi'

import { maxButton, swapButton, swapInput, swapInputContainer } from './CoinDetail.css'

interface SwapWidgetProps {
  coinAddress: Address
  symbol: string
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
  isClankerToken?: boolean
}

export const SwapWidget = ({ coinAddress, symbol, chainId }: SwapWidgetProps) => {
  const [amountIn, setAmountIn] = useState('')
  const [isBuying, setIsBuying] = useState(true) // true = buy coin, false = sell coin
  const [successTxHash, setSuccessTxHash] = useState<`0x${string}` | null>(null)

  const { address: userAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({ chainId })

  const wethAddress = WETH_ADDRESS[chainId as keyof typeof WETH_ADDRESS]

  // Determine tokenIn and tokenOut based on buy/sell
  const tokenIn = isBuying ? wethAddress : coinAddress
  const tokenOut = isBuying ? coinAddress : wethAddress

  // Get user's balance for the input token
  const { data: wethBalance, refetch: refreshWethBalance } = useBalance({
    address: userAddress,
    token: wethAddress,
    chainId,
  })

  const { data: coinBalance, refetch: refreshCoinBalance } = useReadContract({
    address: coinAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId,
  })

  const inputBalance = isBuying ? wethBalance?.value : coinBalance

  // Build swap path
  const { path, isLoading: isLoadingPath } = useSwapPath({
    chainId,
    tokenIn,
    tokenOut,
    enabled: !!tokenIn && !!tokenOut,
  })

  // Parse amount
  const amountInBigInt = amountIn ? parseEther(amountIn) : 0n

  // Check if amount exceeds balance
  const exceedsBalance = inputBalance !== undefined && amountInBigInt > inputBalance

  // Get quote
  const {
    amountOut,
    isLoading: isLoadingQuote,
    error: quoteError,
  } = useSwapQuote({
    chainId,
    path: path ?? undefined,
    amountIn: amountInBigInt,
    slippage: 0.01, // 1%
    enabled: !!path && amountInBigInt > 0n && !exceedsBalance,
  })

  const {
    execute,
    isExecuting,
    error: executeError,
  } = useExecuteSwap({
    walletClient: walletClient ?? undefined,
    publicClient: publicClient ?? undefined,
  })

  const handleSwap = async () => {
    if (
      !path ||
      !walletClient?.account ||
      !amountInBigInt ||
      amountInBigInt === 0n ||
      !amountOut ||
      amountOut === 0n
    )
      return

    setSuccessTxHash(null)

    try {
      const txHash = await execute({
        chainId: chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA,
        path,
        amountIn: amountInBigInt,
        amountOut,
        slippage: 0.01,
      })

      refreshWethBalance()
      refreshCoinBalance()

      // Reset form on success
      setAmountIn('')
      setSuccessTxHash(txHash)
    } catch (err) {
      console.error('Swap failed:', err)
    }
  }

  const handleMaxClick = () => {
    if (inputBalance !== undefined) {
      setAmountIn(formatEther(inputBalance))
    }
  }

  const isLoading = isLoadingPath || isLoadingQuote || isExecuting
  const error = quoteError || executeError

  // Better error messages
  const getErrorMessage = (): string | null => {
    if (exceedsBalance) {
      return `Insufficient ${isBuying ? 'WETH' : symbol} balance`
    }
    if (!userAddress) {
      return 'Please connect your wallet'
    }
    if (!path && !isLoadingPath && amountInBigInt > 0n) {
      return 'No swap route available for this pair'
    }
    if (error) {
      if (error.message.includes('User rejected')) {
        return 'Transaction cancelled'
      }
      if (error.message.includes('insufficient funds')) {
        return 'Insufficient funds for gas'
      }
      if (error.message.includes('slippage')) {
        return 'Price moved too much. Please try again.'
      }
      return 'Swap failed. Please try again.'
    }
    return null
  }

  const errorMessage = getErrorMessage()
  const canSwap =
    !!path &&
    !!amountInBigInt &&
    amountInBigInt > 0n &&
    !!walletClient?.account &&
    !isLoading &&
    !exceedsBalance

  return (
    <Box>
      {/* Buy/Sell Toggle */}
      <Flex gap="x2" mb="x4">
        <Button
          variant={isBuying ? 'primary' : 'secondary'}
          onClick={() => {
            setIsBuying(true)
            setAmountIn('')
            setSuccessTxHash(null)
          }}
          style={{ flex: 1 }}
        >
          Buy {symbol}
        </Button>
        <Button
          variant={!isBuying ? 'primary' : 'secondary'}
          onClick={() => {
            setIsBuying(false)
            setAmountIn('')
            setSuccessTxHash(null)
          }}
          style={{ flex: 1 }}
        >
          Sell {symbol}
        </Button>
      </Flex>

      {/* Input Section */}
      <Box className={swapInputContainer}>
        <Flex justify="space-between" align="center" mb="x2">
          <Text variant="label-sm" color="text3">
            You pay
          </Text>
          {inputBalance !== undefined && (
            <Text variant="paragraph-xs" color="text4">
              Balance: {parseFloat(formatEther(inputBalance)).toFixed(4)}
            </Text>
          )}
        </Flex>
        <Flex align="center" gap="x2">
          <Input
            type="number"
            placeholder="0.0"
            value={amountIn}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setAmountIn(e.target.value)
              setSuccessTxHash(null)
            }}
            className={swapInput}
            style={{ flex: 1 }}
          />
          <Button onClick={handleMaxClick} className={maxButton} disabled={!inputBalance}>
            MAX
          </Button>
        </Flex>
        <Text variant="paragraph-sm" color="text4" mt="x1">
          {isBuying ? 'WETH' : symbol}
        </Text>
      </Box>

      {/* Output Display */}
      {amountOut && amountOut > 0n && !exceedsBalance && (
        <Box className={swapInputContainer} mt="x4">
          <Text variant="label-sm" color="text3" mb="x2">
            You receive (estimated)
          </Text>
          <Text variant="heading-sm">
            {parseFloat(formatEther(amountOut)).toFixed(6)}
          </Text>
          <Text variant="paragraph-sm" color="text4" mt="x1">
            {isBuying ? symbol : 'WETH'}
          </Text>
        </Box>
      )}

      {/* Success Message */}
      {successTxHash && (
        <Box mt="x4" p="x3" backgroundColor="positiveHover" borderRadius="curved">
          <Text variant="paragraph-sm">
            Swap successful! View transaction:{' '}
            <a
              style={{ display: 'inline-block' }}
              href={`${ETHERSCAN_BASE_URL[chainId]}/tx/${successTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              <Text>{truncateHex(successTxHash)}</Text>
            </a>
          </Text>
        </Box>
      )}

      {/* Error Display */}
      {errorMessage && (
        <Box mt="x4">
          <Text variant="paragraph-sm" color="negative">
            {errorMessage}
          </Text>
        </Box>
      )}

      {/* Swap Button */}
      <Button
        onClick={handleSwap}
        disabled={!canSwap}
        className={swapButton}
        mt="x4"
        style={{ width: '100%' }}
      >
        {isExecuting
          ? 'Swapping...'
          : isLoadingPath
            ? 'Finding route...'
            : isLoadingQuote
              ? 'Getting quote...'
              : !userAddress
                ? 'Connect Wallet'
                : !path && amountInBigInt > 0n
                  ? 'No route available'
                  : exceedsBalance
                    ? 'Insufficient Balance'
                    : 'Swap'}
      </Button>

      {/* Path Info */}
      {path && (
        <Box mt="x4">
          <Text variant="label-sm" color="text3" mb="x1">
            Route: {path.hops.length} hop{path.hops.length > 1 ? 's' : ''}
          </Text>
          <Text variant="paragraph-xs" color="text4">
            {path.isOptimal ? 'Optimal route' : 'Available route'}
          </Text>
        </Box>
      )}
    </Box>
  )
}
