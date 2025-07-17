import { Box, Button, Flex, PopUp, Text } from '@buildeross/zord'
import React, { Fragment, memo, useEffect, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { Address, formatEther, parseEther } from 'viem'
import { useAccount, useBalance, useConfig, useReadContracts } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { ContractButton } from 'src/components/ContractButton'
import { Icon } from 'src/components/Icon/Icon'
import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { PUBLIC_IS_TESTNET } from 'src/constants/chains'
import SWR_KEYS from 'src/constants/swrKeys'
import { auctionAbi } from 'src/data/contract/abis'
import { averageWinningBid } from 'src/data/subgraph/requests/averageWinningBid'
import { getBids } from 'src/data/subgraph/requests/getBids'
import { useDaoStore } from 'src/modules/dao'
import { AddressType, Chain } from 'src/typings'
import { unpackOptionalArray } from 'src/utils/helpers'
import { formatCryptoVal } from 'src/utils/numbers'

import { useMinBidIncrement } from '../../hooks'
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
    addresses.token ? [SWR_KEYS.AVERAGE_WINNING_BID, chain.id, addresses.token] : null,
    () => averageWinningBid(chain.id, addresses.token as Address)
  )

  const isMinBid = Number(bidAmount) >= minBidAmount
  const formattedMinBid = formatCryptoVal(minBidAmount)
  const minBidAmountInWei = parseEther(formattedMinBid)

  // Warn users if they are bidding more than 5x the average winning bid or min bid amount
  const valueToCalculateWarning = averageBid || minBidAmountInWei
  const minAmountForWarning = valueToCalculateWarning * 5n

  const handleCreateBid = async () => {
    if (!isMinBid || !bidAmount || creatingBid) return

    const amountInWei = parseEther(bidAmount)

    if (amountInWei && minAmountForWarning && amountInWei > minAmountForWarning) {
      setShowWarning(true)
      return
    }

    await createBidTransaction()
  }

  const createBidTransaction = async () => {
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
  }

  useEffect(() => {
    document.body.style.overflow = !!showWarning ? 'hidden' : 'unset'
  }, [showWarning])

  const isValidBid = bidAmount && isMinBid
  const isValidChain = wagmiChain?.id === chain.id
  const [showTooltip, setShowTooltip] = useState(false)
  const [copied, setCopied] = useState(false)

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
                    className={auctionActionButtonVariants['share']}
                    size="lg"
                    ml="x2"
                    mt={{ '@initial': 'x2', '@768': 'x0' }}
                    handleClick={async () => {
                      const network = PUBLIC_IS_TESTNET
                        ? 'https://testnet.nouns.build'
                        : 'https://nouns.build'
                      const baseUrl = `${network}/dao/${chain.name.toLowerCase()}/${
                        addresses.token
                      }`
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
                    }}
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
