import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useEthUsdPrice, useZoraMint, ZORA_PROTOCOL_REWARD } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Input, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import { type Address, formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { ContractButton } from '../ContractButton'
import { Countdown } from '../Countdown'
import TextArea from '../Fields/TextArea'
import {
  errorMessage,
  mintButton,
  mintInput,
  quantityButton,
  quantityInputWrapper,
  successMessage,
  widgetContainer,
} from './DropMintWidget.css'

export interface DropMintWidgetProps {
  chainId: CHAIN_ID
  dropAddress: Address
  symbol: string
  priceEth: string
  saleActive: boolean
  saleNotStarted: boolean
  saleEnded: boolean
  saleStart?: number
  saleEnd?: number
  editionSize?: string
  maxPerAddress?: number
  onMintSuccess?: (txHash: string) => void
}

export const DropMintWidget = ({
  chainId,
  dropAddress,
  //symbol,
  priceEth,
  saleActive,
  saleNotStarted,
  saleEnded,
  saleStart,
  saleEnd,
  // editionSize,
  maxPerAddress,
  onMintSuccess,
}: DropMintWidgetProps) => {
  const [quantity, setQuantity] = useState(1)
  const [comment, setComment] = useState('')
  const { address } = useAccount()
  const isConnected = Boolean(address)

  // Fetch ETH/USD price
  const { price: ethUsdPrice } = useEthUsdPrice()

  const { mint, isPending, isReady, mintStatus, mintError, transactionHash } =
    useZoraMint({
      chainId,
      dropAddress,
      priceEth,
      onSuccess: (txHash) => {
        // Reset form after successful mint
        setQuantity(1)
        setComment('')
        onMintSuccess?.(txHash)
      },
      onError: (error) => {
        console.error('Mint failed:', error)
      },
    })

  const handleMint = async () => {
    await mint(quantity, comment)
  }

  const incrementQuantity = () => {
    const max = maxPerAddress || 999
    setQuantity(Math.min(max, quantity + 1))
  }

  const decrementQuantity = () => {
    setQuantity(Math.max(1, quantity - 1))
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    const max = maxPerAddress || 999
    setQuantity(Math.max(1, Math.min(max, value)))
  }

  // Calculate total price including protocol reward fee
  const salePriceWei = parseEther(priceEth) * BigInt(quantity)
  const protocolRewardWei = parseEther(String(ZORA_PROTOCOL_REWARD)) * BigInt(quantity)
  const totalPriceWei = salePriceWei + protocolRewardWei
  const totalPrice = formatEther(totalPriceWei)

  // Calculate USD prices
  const pricePerMintEth = Number(priceEth) + ZORA_PROTOCOL_REWARD
  const pricePerMintUsd = ethUsdPrice ? pricePerMintEth * ethUsdPrice : null
  const totalPriceUsd = ethUsdPrice ? Number(totalPrice) * ethUsdPrice : null

  // Determine button text based on state
  const getButtonText = () => {
    if (!isConnected) return 'Connect Wallet'
    if (mintStatus === 'confirming-wallet') return 'Confirm in wallet...'
    if (mintStatus === 'pending-tx') return 'Minting...'
    if (mintStatus === 'success') return 'Minted!'
    return `Mint for ${totalPrice} ETH`
  }

  const isButtonDisabled = () => {
    if (!saleActive) return true
    if (!isReady) return true
    if (isPending) return true
    return false
  }

  return (
    <Stack gap="x4" className={widgetContainer}>
      {/* Price */}
      <Box>
        <Text variant="label-sm" color="text3">
          Price
        </Text>
        <Text variant="heading-sm" mt="x1">
          {Number(priceEth) === 0 ? 'Free' : `${priceEth} ETH`}
        </Text>
        <Text variant="paragraph-sm" color="text3" mt="x1">
          + {ZORA_PROTOCOL_REWARD} ETH Zora protocol fee per mint
        </Text>
        {pricePerMintUsd && (
          <Text variant="paragraph-sm" color="text3" mt="x1">
            ~${pricePerMintUsd.toFixed(2)} USD per mint
          </Text>
        )}
      </Box>

      {/* Sale Status */}
      {saleNotStarted && saleStart && (
        <Box>
          <Text variant="label-sm" color="text3">
            Sale starts in
          </Text>
          <Text variant="paragraph-sm" mt="x1">
            <Countdown end={saleStart} />
          </Text>
        </Box>
      )}

      {saleEnded && saleEnd && (
        <Box>
          <Text variant="label-sm" color="text3">
            Sale ended
          </Text>
          <Text variant="paragraph-sm" mt="x1">
            {new Date(saleEnd * 1000).toLocaleDateString()}
          </Text>
        </Box>
      )}

      {/* Mint Form - Only show when sale is active */}
      {saleActive && (
        <Stack gap="x3">
          {/* Quantity Selector */}
          <Box>
            <Text variant="label-sm" color="text3" mb="x2">
              Quantity
            </Text>
            <Box className={quantityInputWrapper}>
              <Button
                variant="ghost"
                size="sm"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className={quantityButton}
              >
                -
              </Button>
              <Input
                type="number"
                min="1"
                max={maxPerAddress || 999}
                value={quantity}
                onChange={handleQuantityChange}
                className={mintInput}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={incrementQuantity}
                disabled={maxPerAddress ? quantity >= maxPerAddress : false}
                className={quantityButton}
              >
                +
              </Button>
            </Box>
          </Box>

          {/* Comment Input */}
          <Box>
            <TextArea
              id="mint-comment"
              value={comment}
              onChange={(e: any) => setComment(e.target.value)}
              placeholder="Add a comment to your mint..."
              disabled={isPending}
              maxLength={1000}
              minHeight={96}
              rows={3}
            />
          </Box>

          {/* Error Message */}
          {mintError && (
            <Text variant="paragraph-sm" className={errorMessage}>
              {mintError.message}
            </Text>
          )}

          {/* Success Message with Transaction Link */}
          {mintStatus === 'success' && transactionHash && (
            <Text variant="paragraph-sm" className={successMessage}>
              Successfully minted! View on{' '}
              <a
                style={{ display: 'inline-block' }}
                href={`${ETHERSCAN_BASE_URL[chainId]}/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Explorer
              </a>
            </Text>
          )}

          {/* Total Price Summary */}
          {quantity > 1 && totalPriceUsd && (
            <Box>
              <Flex justify="space-between" align="center">
                <Text variant="paragraph-md" color="text1">
                  Total ({quantity} mints)
                </Text>
                <Box>
                  <Text variant="paragraph-md" color="text1" align="right">
                    {totalPrice} ETH
                  </Text>
                  <Text variant="paragraph-sm" color="text3" align="right" mt="x1">
                    ~${totalPriceUsd.toFixed(2)} USD
                  </Text>
                </Box>
              </Flex>
            </Box>
          )}

          {/* Mint Button */}
          <ContractButton
            chainId={chainId}
            handleClick={handleMint}
            disabled={isButtonDisabled()}
            className={mintButton}
            variant={mintStatus === 'success' ? 'positive' : 'primary'}
          >
            {getButtonText()}
          </ContractButton>
        </Stack>
      )}

      {!saleActive && (
        <Button disabled className={mintButton}>
          {saleNotStarted
            ? 'Sale Not Started'
            : saleEnded
              ? 'Sale Ended'
              : 'Mint Unavailable'}
        </Button>
      )}
    </Stack>
  )
}
