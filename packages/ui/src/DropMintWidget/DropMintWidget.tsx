import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { useZoraMint, ZORA_PROTOCOL_REWARD } from '@buildeross/hooks'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Input, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import { type Address, formatEther, parseEther } from 'viem'
import { useAccount } from 'wagmi'

import { ContractButton } from '../ContractButton'
import { Countdown } from '../Countdown'
import {
  errorMessage,
  mintButton,
  mintInput,
  mintInputContainer,
  quantityButton,
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
            <Flex align="center" gap="x2">
              <Button
                variant="secondary"
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
                variant="secondary"
                size="sm"
                onClick={incrementQuantity}
                disabled={maxPerAddress ? quantity >= maxPerAddress : false}
                className={quantityButton}
              >
                +
              </Button>
            </Flex>
          </Box>

          {/* Comment Input */}
          <Box>
            <Text variant="label-sm" color="text3" mb="x2">
              Comment (optional)
            </Text>
            <Box className={mintInputContainer}>
              <Input
                as="textarea"
                placeholder="Add a comment to your mint..."
                value={comment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setComment(e.target.value)
                }
                rows={3}
              />
            </Box>
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
