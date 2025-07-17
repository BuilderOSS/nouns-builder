import { AddressType, CHAIN_ID } from '@buildeross/types'
import { unpackOptionalArray } from '@buildeross/utils/helpers'
import { formatEther } from 'viem'
import { useReadContract } from 'wagmi'

import { auctionAbi, tokenAbi } from 'src/data/contract/abis'

export type UseDaoAuctionProps = {
  collectionAddress: string
  auctionAddress: string
  chainId: CHAIN_ID
}

export type TokenMetadata = {
  name: string
  description: string
  image: string
}

export type UseDaoAuctionReturnType = {
  highestBid?: string
  tokenUri?: TokenMetadata | null
  highestBidder?: `0x${string}`
  endTime: number
  startTime?: number
  tokenId?: bigint
}

const decode = (token?: string): TokenMetadata | null => {
  if (!token) return null

  const decoded = Buffer.from(token?.substring(29, token?.length) as string, 'base64')

  let data
  try {
    data = JSON.parse(decoded.toString())
  } catch (e) {
    console.error(e)
    data = null
  }

  return data
}

export const useDaoAuction = ({
  collectionAddress,
  auctionAddress,
  chainId,
}: UseDaoAuctionProps): UseDaoAuctionReturnType => {
  const { data: auction } = useReadContract({
    address: auctionAddress as AddressType,
    chainId,
    abi: auctionAbi,
    functionName: 'auction',
  })

  const [tokenId, highestBid, highestBidder, startTime, endTime] = unpackOptionalArray(
    auction,
    6
  )

  const { data: token } = useReadContract({
    address: collectionAddress as AddressType,
    chainId,
    abi: tokenAbi,
    functionName: 'tokenURI',
    args: [tokenId!],
    query: {
      enabled: !!tokenId,
    },
  })

  return {
    highestBid: highestBid ? formatEther(highestBid) : undefined,
    highestBidder: highestBidder,
    tokenUri: decode(token),
    startTime: startTime || 0,
    endTime: endTime || 0,
    tokenId: tokenId,
  }
}
