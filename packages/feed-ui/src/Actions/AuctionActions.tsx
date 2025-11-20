import { useCurrentAuction } from '@buildeross/hooks'
import { auctionAbi } from '@buildeross/sdk/contract'
import type {
  AddressType,
  CHAIN_ID,
  RequiredDaoContractAddresses,
} from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper } from '@buildeross/ui/LinkWrapper'
import { Button, Flex, Text } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { BidModal } from '../Modals/BidModal'

interface AuctionActionsProps {
  daoName: string
  chainId: CHAIN_ID
  tokenId: string
  addresses: RequiredDaoContractAddresses
}

export const AuctionActions: React.FC<AuctionActionsProps> = ({
  daoName,
  chainId,
  tokenId,
  addresses,
}) => {
  const { getAuctionLink } = useLinks()
  const daoId = addresses.token
  const config = useConfig()
  const { address: account } = useAccount()

  const [showBidModal, setShowBidModal] = useState(false)
  const [isSettling, setIsSettling] = useState(false)

  const {
    isActive,
    hasEnded,
    settled,
    currentTokenId,
    highestBid,
    highestBidder,
    isLoading,
    paused,
  } = useCurrentAuction({
    chainId,
    auctionAddress: addresses.auction as AddressType,
  })

  const isWinner = (() => {
    if (!account) return false
    return highestBidder?.toLowerCase() === account.toLowerCase()
  })()

  const handleSettle = useCallback(async () => {
    try {
      setIsSettling(true)
      const data = await simulateContract(config, {
        address: addresses.auction,
        abi: auctionAbi,
        functionName: paused ? 'settleAuction' : 'settleCurrentAndCreateNewAuction',
        chainId,
      })

      const txHash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, { hash: txHash, chainId })
    } catch (error) {
      console.error('Error settling auction:', error)
    } finally {
      setIsSettling(false)
    }
  }, [config, addresses.auction, chainId, paused])

  const buttonText = (() => {
    if (isWinner) return 'Claim NFT'
    if (paused) return 'Settle Auction'
    return 'Start next Auction'
  })()

  if (isLoading) {
    return (
      <Flex gap="x2" align="center">
        <Text fontSize="14" color="text3">
          Loading...
        </Text>
      </Flex>
    )
  }

  const isCurrentToken = currentTokenId?.toString() === tokenId
  const isOldAuction = !isCurrentToken

  return (
    <>
      <Flex gap="x2" align="center" wrap="wrap">
        {/* Active auction - show bid option */}
        {isActive && isCurrentToken && (
          <>
            <Button
              size="sm"
              px="x3"
              variant="outline"
              onClick={() => setShowBidModal(true)}
            >
              Place Bid
            </Button>
            <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
              <Button size="sm" px="x3" variant="secondary">
                View Details
              </Button>
            </LinkWrapper>
          </>
        )}

        {/* Ended but not settled */}
        {hasEnded && !settled && isCurrentToken && (
          <>
            <ContractButton
              chainId={chainId}
              handleClick={handleSettle}
              loading={isSettling}
              variant="outline"
              size="sm"
              px="x3"
            >
              {buttonText}
            </ContractButton>
            <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
              <Button size="sm" px="x3" variant="secondary">
                View Details
              </Button>
            </LinkWrapper>
          </>
        )}

        {/* Old or settled auction */}
        {(isOldAuction || settled) && (
          <>
            <LinkWrapper
              link={getAuctionLink(
                chainId,
                daoId,
                currentTokenId ? currentTokenId.toString() : undefined
              )}
            >
              <Button size="sm" px="x3" variant="outline">
                Go to Latest Auction
              </Button>
            </LinkWrapper>
            <LinkWrapper link={getAuctionLink(chainId, daoId, tokenId)}>
              <Button size="sm" px="x3" variant="secondary">
                View Details
              </Button>
            </LinkWrapper>
          </>
        )}
      </Flex>

      {/* Bid Modal */}
      <BidModal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        chainId={chainId}
        tokenId={tokenId}
        daoName={daoName}
        addresses={addresses}
        highestBid={highestBid}
      />
    </>
  )
}
