import { BASE_URL, SWR_KEYS } from '@buildeross/constants'
import { useMinBidIncrement } from '@buildeross/hooks/useMinBidIncrement'
import { auctionAbi } from '@buildeross/sdk/contract'
import { averageWinningBid } from '@buildeross/sdk/subgraph'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { ShareButton } from '@buildeross/ui/ShareButton'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Text } from '@buildeross/zord'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { formatEther, parseEther, stringToHex } from 'viem'
import { useAccount, useBalance, useConfig, useReadContracts } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import {
  auctionActionButtonVariants,
  bidCommentInput,
  bidForm,
  bidInput,
} from '../Auction.css'
import { WarningModal } from './WarningModal'

interface PlaceBidProps {
  chainId: CHAIN_ID
  auctionAddress: AddressType
  tokenAddress: AddressType
  tokenId: string
  daoName: string
  referral?: AddressType
  highestBid?: bigint
  onSuccess?: () => void
}

const INSUFFICIENT_BALANCE_ERROR = 'Insufficient ETH balance for this bid.'
const INVALID_COMMENT_ERROR =
  'Bid comment contains unsupported characters. Please retype your comment.'
const MAX_BID_COMMENT_BYTES = 140
const ENTER_BID_HELPER_TEXT = (formattedMinBid: string) =>
  `Enter at least ${formattedMinBid} ETH to place a bid.`
const MIN_BID_HELPER_TEXT = (formattedMinBid: string) =>
  `Bid must be at least ${formattedMinBid} ETH.`

const truncateToMaxBytes = (value: string, maxBytes: number) => {
  const encoder = new TextEncoder()
  let byteLength = 0
  let truncated = ''

  for (const char of value) {
    const charLength = encoder.encode(char).length
    if (byteLength + charLength > maxBytes) break
    truncated += char
    byteLength += charLength
  }

  return truncated
}

const InnerPlaceBid = ({
  chainId,
  highestBid,
  referral,
  tokenId,
  daoName,
  auctionAddress,
  tokenAddress,
  onSuccess,
}: PlaceBidProps) => {
  const { address, chain: wagmiChain } = useAccount()
  const { data: balance } = useBalance({ address: address, chainId })
  const { mutate } = useSWRConfig()
  const { getAuctionLink } = useLinks()

  const config = useConfig()

  const [creatingBid, setCreatingBid] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [bidAmount, setBidAmount] = React.useState<string | undefined>(undefined)
  const [bidComment, setBidComment] = React.useState<string>('')
  const [bidError, setBidError] = useState<string | null>(null)
  const [bidCommentError, setBidCommentError] = useState<string | null>(null)

  const auctionContractParams = {
    abi: auctionAbi,
    address: auctionAddress,
    chainId,
  }
  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...auctionContractParams, functionName: 'reservePrice' },
      { ...auctionContractParams, functionName: 'minBidIncrement' },
    ] as const,
  })
  const [auctionReservePrice, minBidIncrement] = unpackOptionalArray(data, 2)

  const { minBidAmount } = useMinBidIncrement({
    highestBid,
    reservePrice: auctionReservePrice,
    minBidIncrement,
  })

  const { data: averageBid } = useSWR(
    tokenAddress && chainId
      ? ([SWR_KEYS.AVERAGE_WINNING_BID, chainId, tokenAddress.toLowerCase()] as const)
      : null,
    ([, _chainId, _token]) => averageWinningBid(_chainId, _token as AddressType)
  )

  const isMinBid = useMemo(
    () => Number(bidAmount) >= minBidAmount,
    [bidAmount, minBidAmount]
  )
  const formattedMinBid = formatCryptoVal(minBidAmount)
  const minBidAmountInWei = parseEther(formattedMinBid)

  // Warn users if they are bidding more than 5x the average winning bid or min bid amount
  const valueToCalculateWarning = useMemo(
    () => averageBid || minBidAmountInWei,
    [averageBid, minBidAmountInWei]
  )
  const minAmountForWarning = useMemo(
    () => valueToCalculateWarning * 5n,
    [valueToCalculateWarning]
  )
  const bidAmountInWei = useMemo(() => {
    if (!bidAmount) return undefined

    try {
      return parseEther(bidAmount)
    } catch {
      return undefined
    }
  }, [bidAmount])
  const bidCommentDataSuffix = useMemo(() => {
    const trimmedComment = bidComment.trim()
    if (!trimmedComment) return undefined
    if (trimmedComment.includes('\uFFFD')) return undefined
    if (new TextEncoder().encode(trimmedComment).length > MAX_BID_COMMENT_BYTES) {
      return undefined
    }

    return stringToHex(trimmedComment)
  }, [bidComment])
  const hasInsufficientBalance = useMemo(() => {
    if (bidAmountInWei == null || balance?.value == null) return false
    return bidAmountInWei > balance.value
  }, [bidAmountInWei, balance?.value])

  const createBidTransaction = useCallback(async () => {
    if (!isMinBid || !bidAmount || !tokenAddress || !auctionAddress) return

    try {
      setCreatingBid(true)

      let txHash: `0x${string}`
      if (referral) {
        const data = await simulateContract(config, {
          abi: auctionAbi,
          address: auctionAddress,
          functionName: 'createBidWithReferral',
          args: [BigInt(tokenId), referral],
          value: parseEther(bidAmount),
          chainId,
          ...(bidCommentDataSuffix ? { dataSuffix: bidCommentDataSuffix } : {}),
        })
        txHash = await writeContract(config, data.request)
      } else {
        const data = await simulateContract(config, {
          abi: auctionAbi,
          address: auctionAddress,
          functionName: 'createBid',
          args: [BigInt(tokenId)],
          value: parseEther(bidAmount),
          chainId,
          ...(bidCommentDataSuffix ? { dataSuffix: bidCommentDataSuffix } : {}),
        })
        txHash = await writeContract(config, data.request)
      }

      if (txHash) await waitForTransactionReceipt(config, { hash: txHash, chainId })

      await mutate([
        SWR_KEYS.AUCTION_BIDS,
        chainId,
        tokenAddress.toLowerCase(),
        tokenId.toString(),
      ])

      await mutate([SWR_KEYS.AVERAGE_WINNING_BID, chainId, tokenAddress.toLowerCase()])

      setBidAmount(undefined)
      setBidComment('')
      setBidError(null)

      // Call onSuccess callback if provided
      onSuccess?.()
    } catch (error) {
      console.error(error)
      if (
        error instanceof Error &&
        error.message.toLowerCase().includes('insufficient funds')
      ) {
        setBidError(INSUFFICIENT_BALANCE_ERROR)
      }
    } finally {
      setCreatingBid(false)
      setShowWarning(false)
    }
  }, [
    isMinBid,
    bidAmount,
    referral,
    config,
    auctionAddress,
    tokenAddress,
    tokenId,
    chainId,
    bidCommentDataSuffix,
    mutate,
    onSuccess,
  ])

  const handleCreateBid = useCallback(async () => {
    if (!isMinBid || !bidAmount || creatingBid) return
    if (bidCommentError) return

    if (hasInsufficientBalance) {
      setBidError(INSUFFICIENT_BALANCE_ERROR)
      return
    }

    const amountInWei = bidAmountInWei

    if (amountInWei == null) return

    if (amountInWei && minAmountForWarning && amountInWei > minAmountForWarning) {
      setShowWarning(true)
      return
    }

    setBidError(null)
    await createBidTransaction()
  }, [
    isMinBid,
    bidAmount,
    creatingBid,
    hasInsufficientBalance,
    bidAmountInWei,
    minAmountForWarning,
    createBidTransaction,
    bidCommentError,
  ])

  useEffect(() => {
    document.body.style.overflow = !!showWarning ? 'hidden' : 'unset'
  }, [showWarning])

  useEffect(() => {
    const trimmedComment = bidComment.trim()
    if (trimmedComment && trimmedComment.includes('\uFFFD')) {
      setBidCommentError(INVALID_COMMENT_ERROR)
      return
    }

    setBidCommentError(null)
  }, [bidComment])

  const isValidBid = bidAmount && isMinBid
  const isValidChain = wagmiChain?.id === chainId
  const hasBidAmount = !!bidAmount
  const shouldDisableBidButton =
    address && isValidChain
      ? !isValidBid || hasInsufficientBalance || !!bidCommentError
      : false
  const disabledBidMessage = useMemo(() => {
    if (!(address && isValidChain)) return null
    if (hasInsufficientBalance) return INSUFFICIENT_BALANCE_ERROR
    if (bidCommentError) return bidCommentError
    if (!hasBidAmount) return ENTER_BID_HELPER_TEXT(formattedMinBid)
    if (!isMinBid) return MIN_BID_HELPER_TEXT(formattedMinBid)
    return null
  }, [
    address,
    isValidChain,
    hasInsufficientBalance,
    bidCommentError,
    hasBidAmount,
    formattedMinBid,
    isMinBid,
  ])
  const helperText = bidError || bidCommentError || disabledBidMessage
  const helperTextColor =
    bidError || bidCommentError || hasInsufficientBalance ? 'negative' : 'tertiary'

  // Build share URL with referral parameter if user is connected
  const shareUrl = useMemo(() => {
    const link = getAuctionLink(chainId, tokenAddress, tokenId)
    const baseUrl = link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`
    if (!address) return baseUrl

    const url = new URL(baseUrl)
    url.searchParams.set('referral', address.toString())
    return url.toString()
  }, [chainId, tokenAddress, tokenId, getAuctionLink, address])

  return (
    <Flex
      width="100%"
      direction={{ '@initial': 'column', '@768': 'row' }}
      justify={'flex-start'}
    >
      {bidAmount && valueToCalculateWarning ? (
        <AnimatedModal size={'small'} open={showWarning}>
          <WarningModal
            daoName={daoName}
            currentBid={bidAmount}
            isCreatingBid={creatingBid}
            isAverage={!!averageBid}
            maxReccomendedBid={formatEther(valueToCalculateWarning)}
            onCancel={() => setShowWarning(false)}
            onConfirm={() => createBidTransaction()}
          />
        </AnimatedModal>
      ) : null}

      {!creatingBid ? (
        <Flex wrap="wrap" gap="x2">
          <form className={bidForm}>
            <Box position="relative" mr={{ '@initial': 'x0', '@768': 'x2' }}>
              <input
                placeholder={`${formattedMinBid} ETH or more`}
                type={'number'}
                className={bidInput}
                value={bidAmount ?? ''}
                min={formattedMinBid}
                max={formatEther(balance?.value ?? 0n)}
                onChange={(event) => {
                  const nextBidAmount = event.target.value
                  setBidAmount(nextBidAmount)

                  if (!nextBidAmount) {
                    setBidError(null)
                    return
                  }

                  try {
                    const nextBidAmountInWei = parseEther(nextBidAmount)
                    if (balance?.value != null && nextBidAmountInWei > balance.value) {
                      setBidError(INSUFFICIENT_BALANCE_ERROR)
                    } else {
                      setBidError(null)
                    }
                  } catch {
                    setBidError(null)
                  }
                }}
              />
              <Box position="absolute" style={{ top: 0, right: 0, bottom: 0 }}>
                <Flex align={'center'} height={'100%'} pr={'x4'} fontWeight={'display'}>
                  ETH
                </Flex>
              </Box>
            </Box>
            <Box mt="x2" mr={{ '@initial': 'x0', '@768': 'x2' }}>
              <textarea
                id="bid-comment"
                aria-label="Add a bid comment"
                placeholder="Add a bid comment (optional)"
                value={bidComment}
                maxLength={MAX_BID_COMMENT_BYTES}
                rows={3}
                className={bidCommentInput}
                onChange={(event) =>
                  setBidComment(
                    truncateToMaxBytes(event.target.value, MAX_BID_COMMENT_BYTES)
                  )
                }
              />
            </Box>
            {helperText ? (
              <Text variant="paragraph-sm" color={helperTextColor} mt="x2">
                {helperText}
              </Text>
            ) : null}
          </form>
          <Flex w="100%" wrap="wrap" mt="x2">
            <ContractButton
              chainId={chainId}
              className={auctionActionButtonVariants['bid']}
              size="lg"
              handleClick={handleCreateBid}
              disabled={shouldDisableBidButton}
              mt={{ '@initial': 'x2', '@768': 'x0' }}
            >
              Place bid
            </ContractButton>
            {chainId !== 1 ? (
              <Box ml="x2" mt={{ '@initial': 'x2', '@768': 'x0' }}>
                <ShareButton
                  url={shareUrl}
                  size="lg"
                  variant="primary"
                  className={auctionActionButtonVariants['share']}
                  tooltip="Copy Referral Link"
                />
              </Box>
            ) : null}
          </Flex>
        </Flex>
      ) : (
        <Button className={auctionActionButtonVariants['bidding']} disabled size="lg">
          Placing {bidAmount} ETH bid
        </Button>
      )}
    </Flex>
  )
}

export const PlaceBid = memo(InnerPlaceBid)
