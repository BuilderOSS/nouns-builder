import { BASE_URL } from '@buildeross/constants/baseUrl'
import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import type { AuctionStatus } from '@buildeross/sdk/subgraph'
import type { CHAIN_ID } from '@buildeross/types'
import { useMemo } from 'react'
import useSWR from 'swr'

export type AuctionStatusResponse = {
  syncedBlock: number
  stale: boolean
  /** keyed by DAO token address (lowercase); null when the DAO has no auction */
  auctions: Record<string, AuctionStatus | null>
}

/** Poll interval while any requested auction is live */
export const AUCTION_STATUS_LIVE_INTERVAL = 5_000
/** Poll interval when nothing is live (settled, paused, or long ended) */
export const AUCTION_STATUS_IDLE_INTERVAL = 30_000
/** Keep polling quickly for a while after the end time, waiting for settlement */
const SETTLEMENT_GRACE_SECONDS = 60

export const isAuctionStatusLive = (
  status: AuctionStatus | null | undefined,
  nowSeconds: number
): boolean =>
  !!status && !status.settled && status.endTime + SETTLEMENT_GRACE_SECONDS > nowSeconds

export const getAuctionStatusRefreshInterval = (
  data: AuctionStatusResponse | undefined,
  nowSeconds: number = Date.now() / 1000
): number => {
  if (!data) return AUCTION_STATUS_LIVE_INTERVAL
  return Object.values(data.auctions).some((status) =>
    isAuctionStatusLive(status, nowSeconds)
  )
    ? AUCTION_STATUS_LIVE_INTERVAL
    : AUCTION_STATUS_IDLE_INTERVAL
}

const fetchAuctionStatus = async (
  chainId: CHAIN_ID,
  daos: string
): Promise<AuctionStatusResponse> => {
  const params = new URLSearchParams({ chainId: chainId.toString(), daos })
  const response = await fetch(`${BASE_URL}/api/auction/status?${params.toString()}`)
  if (!response.ok) {
    throw new Error('Failed to fetch auction status')
  }
  return response.json()
}

/**
 * Polls the cached auction status API for a set of DAOs on one chain. Use it
 * to react to new bids, new auctions and settlements instead of watching
 * contract events over RPC.
 *
 * Polls every 5s while any auction is live and every 30s otherwise, and
 * pauses while the tab is hidden.
 */
export const useAuctionStatus = ({
  chainId,
  daos,
  enabled = true,
}: {
  chainId: CHAIN_ID | undefined
  /** DAO token addresses */
  daos: string[]
  enabled?: boolean
}) => {
  const daosKey = useMemo(
    () =>
      Array.from(new Set(daos.filter(Boolean).map((dao) => dao.toLowerCase())))
        .sort()
        .join(','),
    [daos]
  )

  const { data, error, isLoading, mutate } = useSWR(
    enabled && chainId && daosKey
      ? ([SWR_KEYS.AUCTION_STATUS, chainId, daosKey] as const)
      : null,
    ([, _chainId, _daos]) => fetchAuctionStatus(_chainId as CHAIN_ID, _daos),
    {
      refreshInterval: (latest) => getAuctionStatusRefreshInterval(latest),
      revalidateOnFocus: true,
    }
  )

  return { data, error, isLoading, mutate }
}

const groupDaosByChain = (items: Array<{ chainId: CHAIN_ID; dao: string }>) => {
  const byChain = new Map<CHAIN_ID, Set<string>>()
  for (const { chainId, dao } of items) {
    if (!dao) continue
    if (!byChain.has(chainId)) byChain.set(chainId, new Set())
    byChain.get(chainId)!.add(dao.toLowerCase())
  }
  return Array.from(byChain.entries())
    .sort(([a], [b]) => a - b)
    .map(([chainId, daos]) => `${chainId}:${Array.from(daos).sort().join(',')}`)
    .join('|')
}

/**
 * Same as `useAuctionStatus`, for DAOs spread across chains (e.g. the
 * dashboard). Makes one request per chain on each poll.
 */
export const useAuctionStatusByChain = ({
  items,
  enabled = true,
}: {
  items: Array<{ chainId: CHAIN_ID; dao: string }>
  enabled?: boolean
}) => {
  const key = useMemo(() => groupDaosByChain(items), [items])

  const { data, error, isLoading, mutate } = useSWR(
    enabled && key ? ([SWR_KEYS.AUCTION_STATUS, 'by-chain', key] as const) : null,
    async ([, , _key]) => {
      // One failing chain shouldn't hide the others
      const results = await Promise.allSettled(
        _key.split('|').map(async (group) => {
          const [chainId, daos] = group.split(':')
          const response = await fetchAuctionStatus(Number(chainId) as CHAIN_ID, daos)
          return [Number(chainId), response] as const
        })
      )
      const entries = results.flatMap((result) =>
        result.status === 'fulfilled' ? [result.value] : []
      )
      if (!entries.length) throw new Error('Failed to fetch auction status')
      return Object.fromEntries(entries) as Partial<
        Record<CHAIN_ID, AuctionStatusResponse>
      >
    },
    {
      refreshInterval: (latest) =>
        latest &&
        Object.values(latest).every(
          (response) =>
            getAuctionStatusRefreshInterval(response) === AUCTION_STATUS_IDLE_INTERVAL
        )
          ? AUCTION_STATUS_IDLE_INTERVAL
          : AUCTION_STATUS_LIVE_INTERVAL,
      revalidateOnFocus: true,
    }
  )

  return { data, error, isLoading, mutate }
}
