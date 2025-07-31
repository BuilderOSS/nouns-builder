import { L1_CHAINS } from '@buildeross/constants/chains'
import SWR_KEYS from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { getBids } from '@buildeross/sdk/subgraph'
import { AddressType, Chain } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { Flex, Grid } from '@buildeross/zord'
import axios from 'axios'
import React, { Fragment, ReactNode } from 'react'
import { L2MigratedResponse } from 'src/pages/api/migrated'
import { TokenWithDao } from 'src/pages/dao/[network]/[token]/[tokenId]'
import { useDaoStore } from 'src/stores/useDaoStore'
import useSWR from 'swr'
import { formatEther } from 'viem'
import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

import { useAuctionEvents } from '../hooks'
import { auctionGrid, auctionWrapper } from './Auction.css'
import { AuctionDetails } from './AuctionDetails'
import { AuctionImage } from './AuctionImage'
import { AuctionPaused } from './AuctionPaused'
import { AuctionTokenPicker } from './AuctionTokenPicker'
import { BidAmount } from './BidAmount'
import { ActionsWrapper, BidHistory } from './BidHistory'
import { CurrentAuction } from './CurrentAuction'
import { Settle } from './CurrentAuction/Settle'
import { DaoMigrated } from './DaoMigrated'
import { WinningBidder } from './WinningBidder'

interface AuctionControllerProps {
  chain: Chain
  auctionAddress: string
  collection: string
  token: TokenWithDao
  viewSwitcher?: ReactNode
}

export const Auction: React.FC<AuctionControllerProps> = ({
  chain,
  auctionAddress,
  collection,
  token,
}) => {
  const { mintedAt, name, image, owner: tokenOwner, tokenId: queriedTokenId } = token
  const mintDate = mintedAt * 1000
  const bidAmount = token.auction?.winningBid?.amount
  const tokenPrice = bidAmount ? formatEther(bidAmount) : undefined
  const config = useConfig()

  const { treasury } = useDaoStore((x) => x.addresses)

  const { data: migratedRes } = useSWR(
    L1_CHAINS.find((x) => x === chain.id) && treasury
      ? [SWR_KEYS.DAO_MIGRATED, treasury]
      : null,
    ([_key, treasury]) =>
      axios
        .get<L2MigratedResponse>(`/api/migrated?l1Treasury=${treasury}`)
        .then((x) => x.data)
  )

  const { data: auction } = useSWR(
    [SWR_KEYS.AUCTION, chain.id, auctionAddress],
    ([_key, chainId, auctionAddress]) =>
      readContract(config, {
        abi: auctionAbi,
        address: auctionAddress as AddressType,
        functionName: 'auction',
        chainId,
      }),
    { revalidateOnFocus: true }
  )

  const [currentTokenId, highestBid, highestBidder, _, endTime, settled] =
    unpackOptionalArray(auction, 6)

  const hasEnded = endTime && endTime < Date.now() / 1000

  const isTokenActiveAuction =
    !settled &&
    currentTokenId !== undefined &&
    currentTokenId.toString() == queriedTokenId

  const isLatestButNotActive =
    !isTokenActiveAuction && Number(queriedTokenId) > Number(currentTokenId) && hasEnded

  useAuctionEvents({
    chainId: chain.id,
    collection,
    isTokenActiveAuction,
    tokenId: queriedTokenId,
  })

  const { data: bids } = useSWR(
    [SWR_KEYS.AUCTION_BIDS, chain.id, collection, queriedTokenId],
    () => getBids(chain.id, collection, queriedTokenId)
  )

  return (
    <Grid className={auctionGrid}>
      <AuctionImage
        key={`auction-${collection}-image-${queriedTokenId}`}
        image={image || ''}
        isLoading={!auction}
      />
      <Flex
        direction={'column'}
        height={{ '@initial': 'auto', '@768': '100%' }}
        mt={{ '@initial': 'x4', '@768': 'x0' }}
        className={auctionWrapper}
      >
        <AuctionTokenPicker
          mintDate={mintDate}
          name={name}
          collection={collection}
          tokenId={Number(queriedTokenId)}
          currentTokenId={
            currentTokenId && !hasEnded && !isTokenActiveAuction
              ? Number(currentTokenId)
              : undefined
          }
        />

        {isTokenActiveAuction && !!auction && (
          <CurrentAuction
            chain={chain}
            tokenId={queriedTokenId}
            auctionAddress={auctionAddress as AddressType}
            daoName={token.dao.name}
            bid={highestBid}
            owner={highestBidder}
            endTime={endTime}
            bids={bids || []}
          />
        )}

        {!isTokenActiveAuction && !!auction && (
          <Fragment>
            <AuctionDetails>
              <BidAmount isOver bid={tokenPrice ?? undefined} />
              <WinningBidder owner={tokenOwner ?? undefined} />
            </AuctionDetails>
            <ActionsWrapper>
              {isLatestButNotActive && <Settle isEnding={false} owner={tokenOwner} />}
              {(!isLatestButNotActive || (!!bids && bids.length > 0)) && (
                <BidHistory bids={bids || []} />
              )}
            </ActionsWrapper>
            {migratedRes?.migrated ? (
              <DaoMigrated
                l2ChainId={migratedRes.migrated.chainId}
                l2TokenAddress={migratedRes.migrated.l2TokenAddress}
              />
            ) : (
              <AuctionPaused />
            )}
          </Fragment>
        )}
      </Flex>
    </Grid>
  )
}
