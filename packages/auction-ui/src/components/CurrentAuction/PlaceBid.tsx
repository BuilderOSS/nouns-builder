import { BASE_URL, SWR_KEYS } from '@buildeross/constants'
import { auctionAbi } from '@buildeross/sdk/contract'
import { averageWinningBid, getBids } from '@buildeross/sdk/subgraph'
import { useDaoStore } from '@buildeross/stores'
import { AddressType, Chain } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { formatCryptoVal } from '@buildeross/utils/numbers'
import { Box, Button, Flex, Icon, PopUp, Text } from '@buildeross/zord'
import React, { Fragment, memo, useCallback, useEffect, useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { Address, formatEther, parseEther } from 'viem'
import { useAccount, useBalance, useConfig, useReadContracts } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { useMinBidIncrement } from '@buildeross/hooks/useMinBidIncrement'
import { auctionActionButtonVariants, bidForm, bidInput } from '../Auction.css'
import { WarningModal } from './WarningModal'

interface PlaceBidProps {
  chain: Chain
  tokenId: string
  daoName: string
  referral?: AddressType
  highestBid?: bigint
}

export const PlaceBid = ({
  chain,
  highestBid,
  referral,
  tokenId,
  daoName,
}: PlaceBidProps) => {
  const { address, chain: wagmiChain } = useAccount()
  const { data: balance } = useBalance({ address: address, chainId: chain.id })
  const { mutate } = useSWRConfig()
  const { addresses } = useDaoStore()

  const config = useConfig()

  const [creatingBid, setCreatingBid] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [bidAmount, setBidAmount] = React.useState<string | undefined>(undefined)

  const auctionContractParams = {
    abi: auctionAbi,
    address: addresses.auction as AddressType,
    chainId: chain.id,
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
    addresses.token && chain.id
      ? ([SWR_KEYS.AVERAGE_WINNING_BID, chain.id, addresses.token] as const)
      : null,
    ([, _chainId, _token]) => averageWinningBid(_chainId, _token)
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

  const createBidTransaction = useCallback(async () => {
    if (!isMinBid || !bidAmount) return

    try {
      setCreatingBid(true)

      let txHash: `0x${string}`
      if (referral) {
        const data = await simulateContract(config, {
          abi: auctionAbi,
          address: addresses.auction as Address,
          functionName: 'createBidWithReferral',
          args: [BigInt(tokenId), referral],
          value: parseEther(bidAmount),
          chainId: chain.id,
        })
        txHash = await writeContract(config, data.request)
      } else {
        const data = await simulateContract(config, {
          abi: auctionAbi,
          address: addresses.auction as Address,
          functionName: 'createBid',
          args: [BigInt(tokenId)],
          value: parseEther(bidAmount),
          chainId: chain.id,
        })
        txHash = await writeContract(config, data.request)
      }

      if (txHash)
        await waitForTransactionReceipt(config, { hash: txHash, chainId: chain.id })

      await mutate([SWR_KEYS.AUCTION_BIDS, chain.id, addresses.token, tokenId], () =>
        getBids(chain.id, addresses.token!, tokenId)
      )

      await mutate([SWR_KEYS.AVERAGE_WINNING_BID, chain.id, addresses.token], () =>
        averageWinningBid(chain.id, addresses.token as Address)
      )
    } catch (error) {
      console.error(error)
    } finally {
      setCreatingBid(false)
      setShowWarning(false)
    }
  }, [
    isMinBid,
    bidAmount,
    referral,
    config,
    addresses.auction,
    addresses.token,
    tokenId,
    chain.id,
    mutate,
  ])

  const handleCreateBid = useCallback(async () => {
    if (!isMinBid || !bidAmount || creatingBid) return

    const amountInWei = parseEther(bidAmount)

    if (amountInWei && minAmountForWarning && amountInWei > minAmountForWarning) {
      setShowWarning(true)
      return
    }

    await createBidTransaction()
  }, [isMinBid, bidAmount, creatingBid, minAmountForWarning, createBidTransaction])

  useEffect(() => {
    document.body.style.overflow = !!showWarning ? 'hidden' : 'unset'
  }, [showWarning])

  const isValidBid = bidAmount && isMinBid
  const isValidChain = wagmiChain?.id === chain.id
  const [showTooltip, setShowTooltip] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShareClick = useCallback(async () => {
    const baseUrl = `${BASE_URL}/dao/${chain.name.toLowerCase()}/${addresses.token}`
    if (address === undefined) {
      await navigator.clipboard.writeText(baseUrl)
      return
    }
    const params = new URLSearchParams({
      referral: address.toString(),
    })
    const fullUrl = `${baseUrl}?${params}`

    await navigator.clipboard.writeText(fullUrl)
    setCopied(true)
  }, [chain.name, addresses.token, address])

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
                min={formattedMinBid}
                max={formatEther(balance?.value ?? 0n)}
                onChange={(event) => setBidAmount(event.target.value)}
              />
              <Box position="absolute" style={{ top: 0, right: 0, bottom: 0 }}>
                <Flex align={'center'} height={'100%'} pr={'x4'} fontWeight={'display'}>
                  ETH
                </Flex>
              </Box>
            </Box>
          </form>
          <Flex w="100%" wrap="wrap" mt="x2">
            <ContractButton
              chainId={chain.id}
              className={auctionActionButtonVariants['bid']}
              size="lg"
              handleClick={handleCreateBid}
              disabled={address && isValidChain ? !isValidBid : false}
              mt={{ '@initial': 'x2', '@768': 'x0' }}
            >
              Place bid
            </ContractButton>
            {chain.id !== 1 ? (
              <Fragment>
                <Box
                  cursor="pointer"
                  onMouseOver={() => setShowTooltip(true)}
                  onMouseLeave={() => {
                    setShowTooltip(false)
                    setTimeout(() => {
                      setCopied(false)
                    }, 500)
                  }}
                >
                  <ContractButton
                    chainId={chain.id}
                    className={auctionActionButtonVariants['share']}
                    size="lg"
                    ml="x2"
                    mt={{ '@initial': 'x2', '@768': 'x0' }}
                    handleClick={handleShareClick}
                  >
                    <Icon size="md" id="share" />
                  </ContractButton>
                </Box>
                <PopUp open={showTooltip} trigger={<></>} placement="top">
                  <Text align="center">{copied ? 'Copied' : 'Copy Referral Link'}</Text>
                </PopUp>
              </Fragment>
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

export const MemoizedPlaceBid = memo(PlaceBid)
