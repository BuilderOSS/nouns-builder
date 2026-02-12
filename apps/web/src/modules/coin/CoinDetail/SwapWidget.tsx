import { NATIVE_TOKEN_ADDRESS } from '@buildeross/constants/addresses'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import {
  useAvailablePaymentTokens,
  useExecuteSwap,
  useSwapPath,
  useSwapQuote,
  useTokenMetadata,
} from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { DropdownSelect, SelectOption } from '@buildeross/ui/DropdownSelect'
import { truncateHex } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Input, Text } from '@buildeross/zord'
import { useMemo, useState } from 'react'
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
  const [selectedPaymentToken, setSelectedPaymentToken] =
    useState<Address>(NATIVE_TOKEN_ADDRESS) // Default to native ETH
  const [successTxHash, setSuccessTxHash] = useState<`0x${string}` | null>(null)
  const [pendingTxHash, setPendingTxHash] = useState<`0x${string}` | null>(null)
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false)

  const { address: userAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient({ chainId })

  // Fetch available payment tokens for this coin
  const { tokens: availableTokens, isLoading: isLoadingTokens } =
    useAvailablePaymentTokens(chainId, coinAddress)

  // Get token metadata for ERC20 tokens (not ETH)
  const erc20Addresses = availableTokens
    .filter((t) => t.address.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase())
    .map((t) => t.address)

  const { metadata: tokenMetadataList } = useTokenMetadata(chainId, erc20Addresses)

  // Determine tokenIn and tokenOut based on buy/sell
  const tokenIn = isBuying ? selectedPaymentToken : coinAddress
  const tokenOut = isBuying ? coinAddress : selectedPaymentToken

  // Check if selected payment token is native ETH
  const isNativeEth =
    selectedPaymentToken.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()

  // Get balance for native ETH (always fetch for dropdown display)
  const { data: nativeEthBalance, refetch: refreshNativeEthBalance } = useBalance({
    address: userAddress,
    chainId,
  })

  // Get WETH address for balance fetch
  const wethToken = availableTokens.find(
    (t) =>
      t.type === 'weth' && t.address.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase()
  )

  // Get balance for WETH (always fetch for dropdown display)
  const { data: wethBalance, refetch: refreshWethBalance } = useReadContract({
    address: wethToken?.address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: !!wethToken && !!userAddress,
    },
  })

  // Get balance for the coin (when selling)
  const { data: coinBalance, refetch: refreshCoinBalance } = useReadContract({
    address: coinAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    chainId,
    query: {
      enabled: !isBuying,
    },
  })

  const inputBalance = isBuying
    ? isNativeEth
      ? nativeEthBalance?.value
      : wethBalance
    : coinBalance

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
      amountOut === 0n ||
      !publicClient
    )
      return

    setSuccessTxHash(null)
    setPendingTxHash(null)

    try {
      const txHash = await execute({
        chainId: chainId as CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA,
        path,
        amountIn: amountInBigInt,
        amountOut,
        slippage: 0.01,
      })

      // Show pending transaction with link
      setPendingTxHash(txHash)
      setIsWaitingForConfirmation(true)

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
        confirmations: 1,
      })

      setPendingTxHash(null)
      setIsWaitingForConfirmation(false)

      // Check if transaction was successful
      if (receipt.status === 'reverted') {
        throw new Error('Transaction reverted')
      }

      // Refresh appropriate balances based on transaction type
      if (isBuying) {
        // Refresh payment token balance (what we spent)
        if (isNativeEth) {
          refreshNativeEthBalance()
        } else {
          refreshWethBalance()
        }
        // Refresh coin balance (what we received)
        refreshCoinBalance()
      } else {
        // Refresh coin balance (what we spent)
        refreshCoinBalance()
        // Refresh payment token balance (what we received)
        if (isNativeEth) {
          refreshNativeEthBalance()
        } else {
          refreshWethBalance()
        }
      }

      // Reset form and show success only after confirmation
      setAmountIn('')
      setSuccessTxHash(txHash)
    } catch (err) {
      setPendingTxHash(null)
      setIsWaitingForConfirmation(false)
      console.error('Swap failed:', err)
    }
  }

  const handleMaxClick = () => {
    if (inputBalance !== undefined) {
      setAmountIn(formatEther(inputBalance))
    }
  }

  const isLoading =
    isLoadingPath || isLoadingQuote || isExecuting || isWaitingForConfirmation
  const error = quoteError || executeError

  // Better error messages
  const getErrorMessage = (): string | null => {
    if (exceedsBalance) {
      const tokenSymbol = isBuying
        ? availableTokens.find(
            (t) => t.address.toLowerCase() === selectedPaymentToken.toLowerCase()
          )?.symbol || 'ETH'
        : symbol
      return `Insufficient ${tokenSymbol} balance`
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

  // Create dropdown options for payment tokens with balances
  const tokenOptions: SelectOption<Address>[] = useMemo(() => {
    return availableTokens.map((token) => {
      const isNative = token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
      const balance = isNative ? nativeEthBalance?.value : wethBalance

      // Get token metadata for ERC20 tokens
      const metadata = isNative
        ? null
        : tokenMetadataList?.find(
            (m) => m.address.toLowerCase() === token.address.toLowerCase()
          )

      // Format: "Token Name (123 SYMBOL)" or "ETH (123 ETH)"
      let label = isNative ? 'ETH' : metadata?.name || token.symbol

      if (balance !== undefined) {
        const formattedBalance = parseFloat(formatEther(balance)).toFixed(4)
        const symbol = isNative ? 'ETH' : metadata?.symbol || token.symbol
        label = `${label} (${formattedBalance} ${symbol})`
      }

      return {
        value: token.address,
        label,
      }
    })
  }, [availableTokens, nativeEthBalance?.value, wethBalance, tokenMetadataList])

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
            setPendingTxHash(null)
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
            setPendingTxHash(null)
          }}
          style={{ flex: 1 }}
        >
          Sell {symbol}
        </Button>
      </Flex>

      {/* Payment Token Selector (show for both buying and selling) */}
      {availableTokens.length > 0 && !isLoadingTokens && (
        <Box mb="x4">
          <DropdownSelect
            value={selectedPaymentToken}
            onChange={(newToken: Address) => {
              setSelectedPaymentToken(newToken)
              setAmountIn('')
              setSuccessTxHash(null)
              setPendingTxHash(null)
            }}
            options={tokenOptions}
            inputLabel={isBuying ? 'Pay with' : 'Receive'}
          />
        </Box>
      )}

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
              setPendingTxHash(null)
            }}
            className={swapInput}
            style={{ flex: 1 }}
          />
          <Button onClick={handleMaxClick} className={maxButton} disabled={!inputBalance}>
            MAX
          </Button>
        </Flex>
        <Text variant="paragraph-sm" color="text4" mt="x1">
          {isBuying
            ? availableTokens.find(
                (t) => t.address.toLowerCase() === selectedPaymentToken.toLowerCase()
              )?.symbol || 'ETH'
            : symbol}
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
            {isBuying
              ? symbol
              : availableTokens.find(
                  (t) => t.address.toLowerCase() === selectedPaymentToken.toLowerCase()
                )?.symbol || 'ETH'}
          </Text>
        </Box>
      )}

      {/* Pending Transaction Message */}
      {pendingTxHash && (
        <Box mt="x4" p="x3" backgroundColor="background2" borderRadius="curved">
          <Text variant="paragraph-sm" color="text3">
            Transaction pending... View transaction:{' '}
            <a
              style={{ display: 'inline-block' }}
              href={`${ETHERSCAN_BASE_URL[chainId]}/tx/${pendingTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              <Text>{truncateHex(pendingTxHash)}</Text>
            </a>
          </Text>
        </Box>
      )}

      {/* Success Message */}
      {successTxHash && !pendingTxHash && (
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
        {isWaitingForConfirmation
          ? 'Waiting for confirmation...'
          : isExecuting
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
