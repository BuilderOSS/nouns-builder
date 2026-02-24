import { NATIVE_TOKEN_ADDRESS } from '@buildeross/constants/addresses'
import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import {
  useEthUsdPrice,
  useExecuteSwap,
  useSwapOptions,
  useSwapQuote,
  useTokenPrices,
} from '@buildeross/hooks'
import { SwapError, SwapErrorCode, SwapErrorMessages } from '@buildeross/swap'
import { CHAIN_ID } from '@buildeross/types'
import { formatPrice } from '@buildeross/utils/formatMarketCap'
import { truncateHex } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Input, Text } from '@buildeross/zord'
import { useCallback, useMemo, useState } from 'react'
import { Address, erc20Abi, formatEther, parseEther } from 'viem'
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContracts,
  useWalletClient,
} from 'wagmi'

import { ContractButton } from '../ContractButton'
import { DropdownSelect, SelectOption } from '../DropdownSelect'
import {
  maxButton,
  messageText,
  swapButton,
  swapInput,
  swapInputContainer,
} from './SwapWidget.css'

interface SwapWidgetProps {
  coinAddress: Address
  symbol: string
  chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
}

// Toggle to enable/disable the sell tab
const ENABLE_SELL_TAB = false

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

  // Fetch available swap options (tokens + paths) for this coin
  const { options: swapOptions, isLoading: isLoadingOptions } = useSwapOptions(
    chainId,
    coinAddress,
    isBuying
  )

  // Get the selected swap option
  const selectedOption = swapOptions.find(
    (opt) => opt.token.address.toLowerCase() === selectedPaymentToken.toLowerCase()
  )

  // Fetch ETH/USD price
  const { price: ethUsdPrice } = useEthUsdPrice()

  // Get all unique token addresses for price fetching
  const tokenAddressesForPrices = useMemo(() => {
    const addresses: Address[] = [coinAddress]
    swapOptions.forEach((opt) => {
      if (opt.token.address.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase()) {
        addresses.push(opt.token.address)
      }
    })
    return addresses
  }, [coinAddress, swapOptions])

  // Fetch token prices
  const { prices: tokenPrices } = useTokenPrices(chainId, tokenAddressesForPrices)

  // Check if selected payment token is native ETH
  const isNativeEth =
    selectedPaymentToken.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()

  // Get balance for native ETH
  const { data: nativeEthBalance, refetch: refreshNativeEthBalance } = useBalance({
    address: userAddress,
    chainId,
  })

  // Prepare contracts for batch balance fetching
  // Get all ERC20 tokens (swap options + coin itself for selling)
  const erc20Contracts = useMemo(() => {
    if (!userAddress) return []

    const contracts: {
      chainId: CHAIN_ID.BASE | CHAIN_ID.BASE_SEPOLIA
      address: Address
      abi: typeof erc20Abi
      functionName: 'balanceOf'
      args: [Address]
    }[] = []

    // Add all swap option tokens (except ETH)
    swapOptions.forEach((opt) => {
      if (opt.token.address.toLowerCase() !== NATIVE_TOKEN_ADDRESS.toLowerCase()) {
        contracts.push({
          chainId,
          address: opt.token.address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [userAddress],
        })
      }
    })

    // Add the coin itself (for selling and for displaying balance)
    const coinLower = coinAddress.toLowerCase()
    const alreadyIncluded = contracts.some((c) => c.address.toLowerCase() === coinLower)
    if (!alreadyIncluded) {
      contracts.push({
        chainId,
        address: coinAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [userAddress],
      })
    }

    return contracts
  }, [swapOptions, coinAddress, userAddress, chainId])

  // Fetch all ERC20 balances at once
  const { data: erc20Balances, refetch: refreshErc20Balances } = useReadContracts({
    contracts: erc20Contracts,
    allowFailure: false,
    query: {
      enabled: erc20Contracts.length > 0,
    },
  })

  // Create a map of address -> balance for easy lookup
  const balanceMap = useMemo(() => {
    const map = new Map<string, bigint>()

    // Add ETH balance
    if (nativeEthBalance?.value !== undefined) {
      map.set(NATIVE_TOKEN_ADDRESS.toLowerCase(), nativeEthBalance.value)
    }

    // Add ERC20 balances
    erc20Balances?.forEach((result, index) => {
      const address = erc20Contracts[index].address.toLowerCase()
      map.set(address, result as bigint)
    })

    return map
  }, [nativeEthBalance?.value, erc20Balances, erc20Contracts])

  // Get balance for input token
  const inputBalance = isBuying
    ? balanceMap.get(selectedPaymentToken.toLowerCase())
    : balanceMap.get(coinAddress.toLowerCase())

  // Use the path from the selected option
  const path = selectedOption?.path ?? null
  const isLoadingPath = isLoadingOptions

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

      // Refresh all balances after swap
      if (isNativeEth) {
        refreshNativeEthBalance()
      }
      refreshErc20Balances()

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
        ? swapOptions.find(
            (opt) =>
              opt.token.address.toLowerCase() === selectedPaymentToken.toLowerCase()
          )?.token.symbol || 'ETH'
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
      // Check if it's a SwapError with specific error code
      if (error instanceof SwapError) {
        return SwapErrorMessages[error.code]
      }

      // Check for specific error patterns in error message
      const errorMessage = error.message || ''

      // User-initiated errors
      if (
        errorMessage.includes('User rejected') ||
        errorMessage.includes('User denied')
      ) {
        return 'Transaction cancelled'
      }

      // Gas-related errors
      if (errorMessage.includes('insufficient funds')) {
        return 'Insufficient funds for gas'
      }

      // Slippage errors
      if (errorMessage.includes('slippage') || errorMessage.includes('Price impact')) {
        return 'Price moved too much. Please try again.'
      }

      // Liquidity errors (fallback for non-SwapError instances)
      if (
        errorMessage.includes('INSUFFICIENT_LIQUIDITY') ||
        errorMessage.includes('NotEnoughLiquidity') ||
        errorMessage.includes('insufficient liquidity')
      ) {
        return SwapErrorMessages[SwapErrorCode.INSUFFICIENT_LIQUIDITY]
      }

      // Route errors
      if (errorMessage.includes('NO_ROUTE_FOUND') || errorMessage.includes('No route')) {
        return SwapErrorMessages[SwapErrorCode.NO_ROUTE_FOUND]
      }

      // Network errors
      if (
        errorMessage.includes('NETWORK_ERROR') ||
        errorMessage.includes('fetch failed') ||
        errorMessage.includes('network') ||
        errorMessage.includes('timeout')
      ) {
        return SwapErrorMessages[SwapErrorCode.NETWORK_ERROR]
      }

      // Pool configuration errors
      if (
        errorMessage.includes('POOL_CONFIG_ERROR') ||
        errorMessage.includes('Pool') ||
        errorMessage.includes('PoolKey')
      ) {
        return SwapErrorMessages[SwapErrorCode.POOL_CONFIG_ERROR]
      }

      // Contract-specific errors
      if (errorMessage.includes('InsufficientBalance')) {
        return 'Insufficient balance in contract'
      }
      if (errorMessage.includes('InsufficientETH')) {
        return 'Not enough ETH for swap'
      }
      if (errorMessage.includes('InsufficientAllowance')) {
        return 'Token allowance too low. Please try again.'
      }

      // Generic fallback
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

  // Helper to get USD price for a token address
  const getTokenUsdPrice = useCallback(
    (tokenAddress: Address): number | null => {
      const isEth = tokenAddress.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
      if (isEth) {
        return ethUsdPrice ?? null
      }
      return tokenPrices?.[tokenAddress.toLowerCase()] ?? null
    },
    [ethUsdPrice, tokenPrices]
  )

  // Calculate USD values for input and output
  const inputUsdValue = useMemo(() => {
    if (!amountInBigInt || amountInBigInt === 0n) return null
    const inputTokenAddress = isBuying ? selectedPaymentToken : coinAddress
    const price = getTokenUsdPrice(inputTokenAddress)
    if (!price) return null
    const amount = parseFloat(formatEther(amountInBigInt))
    return amount * price
  }, [amountInBigInt, isBuying, selectedPaymentToken, coinAddress, getTokenUsdPrice])

  const outputUsdValue = useMemo(() => {
    if (!amountOut || amountOut === 0n) return null
    const outputTokenAddress = isBuying ? coinAddress : selectedPaymentToken
    const price = getTokenUsdPrice(outputTokenAddress)
    if (!price) return null
    const amount = parseFloat(formatEther(amountOut))
    return amount * price
  }, [amountOut, isBuying, coinAddress, selectedPaymentToken, getTokenUsdPrice])

  // Create dropdown options for payment tokens with balances
  const tokenOptions: SelectOption<Address>[] = useMemo(() => {
    return swapOptions.map((option) => {
      const token = option.token

      // Get balance from balanceMap (works for all tokens now)
      const balance = balanceMap.get(token.address.toLowerCase())

      // Use token name if available, otherwise fall back to symbol
      const displayName = token.name || token.symbol

      // Format label with balance if available
      let label: string
      if (balance !== undefined) {
        const formattedBalance = parseFloat(formatEther(balance)).toFixed(4)
        label = `${displayName} (${formattedBalance} ${token.symbol})`
      } else {
        label = displayName
      }

      return {
        value: token.address,
        label,
      }
    })
  }, [swapOptions, balanceMap])

  return (
    <Box>
      {/* Buy/Sell Toggle or Title */}
      {ENABLE_SELL_TAB ? (
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
      ) : (
        <Text variant="heading-sm" mb="x4">
          Buy {symbol}
        </Text>
      )}

      {/* Payment Token Selector (show for both buying and selling) */}
      {swapOptions.length > 0 && !isLoadingOptions && (
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
        <Flex justify="space-between" align="center" mt="x1">
          <Text variant="paragraph-sm" color="text4">
            {isBuying
              ? swapOptions.find(
                  (opt) =>
                    opt.token.address.toLowerCase() === selectedPaymentToken.toLowerCase()
                )?.token.symbol || 'ETH'
              : symbol}
          </Text>
          {inputUsdValue !== null && (
            <Text variant="paragraph-sm" color="text4">
              ≈ {formatPrice(inputUsdValue)}
            </Text>
          )}
        </Flex>
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
          <Flex justify="space-between" align="center" mt="x1">
            <Text variant="paragraph-sm" color="text4">
              {isBuying
                ? symbol
                : swapOptions.find(
                    (opt) =>
                      opt.token.address.toLowerCase() ===
                      selectedPaymentToken.toLowerCase()
                  )?.token.symbol || 'ETH'}
            </Text>
            {outputUsdValue !== null && (
              <Text variant="paragraph-sm" color="text4">
                ≈ {formatPrice(outputUsdValue)}
              </Text>
            )}
          </Flex>
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
        <Box mt="x4">
          <Text variant="paragraph-sm" color="positive" className={messageText}>
            Swap successful! View on{' '}
            <a
              style={{ display: 'inline-block' }}
              href={`${ETHERSCAN_BASE_URL[chainId]}/tx/${successTxHash}`}
              target="_blank"
              rel="noreferrer"
            >
              Explorer
            </a>
          </Text>
        </Box>
      )}

      {/* Error Display */}
      {errorMessage && (
        <Box mt="x4">
          <Text variant="paragraph-sm" color="negative" className={messageText}>
            {errorMessage}
          </Text>
        </Box>
      )}

      {/* Swap Button */}
      <ContractButton
        chainId={chainId}
        handleClick={handleSwap}
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
      </ContractButton>

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
