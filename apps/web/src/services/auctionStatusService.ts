/**
 * Server-side auction status service
 *
 * Serves auction state (current auction, highest bid, bid count, settled) from
 * the subgraph so clients can poll for new bids and auctions instead of
 * watching contract events over RPC.
 *
 * The subgraph is rate limited (10 req/s, shared by every user), so we fetch a
 * single snapshot of all unsettled auctions per chain and share it between all
 * viewers through an in-process cache, Redis, and a Redis lock that makes sure
 * only one instance refreshes it at a time.
 */

import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import {
  type AuctionStatus,
  daosAuctionStatusRequest,
  liveAuctionsRequest,
  type LiveAuctionsSnapshot,
} from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'

import { getRedisConnection } from './redisConnection'

const CACHE_CONFIG = {
  /** How long a live-auction snapshot is served before refetching */
  SNAPSHOT_TTL_MS: 3_000,
  /** Last good snapshot, served when the subgraph is failing */
  STALE_TTL_S: 60,
  /** Per-DAO fallback for DAOs without an unsettled auction */
  DAO_TTL_MS: 15_000,
  LOCK_TTL_MS: 5_000,
  LOCK_WAIT_MS: 300,
  PREFIX: PUBLIC_IS_TESTNET ? 'testnet:auction-status' : 'auction-status',
} as const

type CachedSnapshot = LiveAuctionsSnapshot & { fetchedAt: number }

export type SnapshotResult = LiveAuctionsSnapshot & { stale: boolean }

export type AuctionStatusesResult = {
  syncedBlock: number
  stale: boolean
  auctions: Record<string, AuctionStatus | null>
}

type MemoryEntry<T> = { value: T; expiresAt: number }

// Server-side in-memory caches (shared across API route invocations in same process)
const snapshotCache = new Map<CHAIN_ID, MemoryEntry<CachedSnapshot>>()
const lastGoodSnapshot = new Map<CHAIN_ID, CachedSnapshot>()
const daoCache = new Map<string, MemoryEntry<AuctionStatus | null>>()

// In-flight deduplication
const inflightSnapshot = new Map<CHAIN_ID, Promise<SnapshotResult>>()

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const snapshotKey = (chainId: CHAIN_ID) => `${CACHE_CONFIG.PREFIX}:${chainId}:snapshot`
const daoKey = (chainId: CHAIN_ID, daoId: string) =>
  `${CACHE_CONFIG.PREFIX}:${chainId}:dao:${daoId}`

async function readRedisSnapshot(key: string): Promise<CachedSnapshot | undefined> {
  const redis = getRedisConnection()
  if (!redis) return undefined
  try {
    const cached = await redis.get(key)
    return cached ? (JSON.parse(cached) as CachedSnapshot) : undefined
  } catch (err) {
    console.warn('Redis auction status read error:', err)
    return undefined
  }
}

function rememberSnapshot(chainId: CHAIN_ID, snapshot: CachedSnapshot) {
  snapshotCache.set(chainId, {
    value: snapshot,
    // Expire relative to when the snapshot was fetched, so Redis and memory
    // caching don't stack on top of each other.
    expiresAt: snapshot.fetchedAt + CACHE_CONFIG.SNAPSHOT_TTL_MS,
  })
  lastGoodSnapshot.set(chainId, snapshot)
}

async function readStaleSnapshot(
  chainId: CHAIN_ID,
  staleKey: string
): Promise<CachedSnapshot | undefined> {
  const fromRedis = await readRedisSnapshot(staleKey)
  if (fromRedis) return fromRedis
  const local = lastGoodSnapshot.get(chainId)
  if (local && Date.now() - local.fetchedAt < CACHE_CONFIG.STALE_TTL_S * 1000)
    return local
  return undefined
}

const fresh = (snapshot: CachedSnapshot): SnapshotResult => ({
  syncedBlock: snapshot.syncedBlock,
  auctions: snapshot.auctions,
  stale: false,
})

async function loadSnapshot(chainId: CHAIN_ID): Promise<SnapshotResult> {
  const redis = getRedisConnection()
  const key = snapshotKey(chainId)
  const staleKey = `${key}:stale`
  const lockKey = `${key}:lock`
  let lockAcquired = false

  if (redis) {
    const cached = await readRedisSnapshot(key)
    if (cached) {
      rememberSnapshot(chainId, cached)
      return fresh(cached)
    }

    try {
      lockAcquired =
        (await redis.set(lockKey, '1', 'PX', CACHE_CONFIG.LOCK_TTL_MS, 'NX')) === 'OK'
    } catch (err) {
      console.warn('Redis auction status lock error:', err)
    }

    if (!lockAcquired) {
      // Another instance is refreshing; wait briefly and re-read
      await delay(CACHE_CONFIG.LOCK_WAIT_MS)
      const afterWait = await readRedisSnapshot(key)
      if (afterWait) {
        rememberSnapshot(chainId, afterWait)
        return fresh(afterWait)
      }

      // Still refreshing: serve the last good snapshot rather than piling
      // more requests onto the subgraph
      const stale = await readStaleSnapshot(chainId, staleKey)
      if (stale) return { ...fresh(stale), stale: true }
    }
  }

  try {
    const snapshot: CachedSnapshot = {
      ...(await liveAuctionsRequest(chainId)),
      fetchedAt: Date.now(),
    }
    rememberSnapshot(chainId, snapshot)

    if (redis) {
      try {
        const serialized = JSON.stringify(snapshot)
        await redis
          .multi()
          .set(key, serialized, 'PX', CACHE_CONFIG.SNAPSHOT_TTL_MS)
          .set(staleKey, serialized, 'EX', CACHE_CONFIG.STALE_TTL_S)
          .exec()
      } catch (err) {
        console.warn('Redis auction status write error:', err)
      }
    }

    return fresh(snapshot)
  } catch (error) {
    console.error('Failed to fetch live auctions:', { chainId, error })
    const stale = await readStaleSnapshot(chainId, staleKey)
    if (stale) return { ...fresh(stale), stale: true }
    throw error
  } finally {
    if (redis && lockAcquired) {
      try {
        await redis.del(lockKey)
      } catch (_) {}
    }
  }
}

/**
 * Snapshot of every unsettled auction on a chain, keyed by DAO token address.
 * At most one subgraph request per chain per SNAPSHOT_TTL_MS across all
 * instances while Redis is available.
 */
export async function getLiveAuctionSnapshot(chainId: CHAIN_ID): Promise<SnapshotResult> {
  const cached = snapshotCache.get(chainId)
  if (cached && cached.expiresAt > Date.now()) return fresh(cached.value)

  const inflight = inflightSnapshot.get(chainId)
  if (inflight) return inflight

  const promise = loadSnapshot(chainId).finally(() => {
    inflightSnapshot.delete(chainId)
  })
  inflightSnapshot.set(chainId, promise)
  return promise
}

/**
 * Current auction for DAOs that aren't in the live snapshot (no unsettled
 * auction). Cached per DAO; misses are fetched in a single batched request.
 */
async function getFallbackStatuses(
  chainId: CHAIN_ID,
  daoIds: string[]
): Promise<Record<string, AuctionStatus | null>> {
  const now = Date.now()
  const result: Record<string, AuctionStatus | null> = {}
  let misses: string[] = []

  for (const daoId of daoIds) {
    const cached = daoCache.get(daoKey(chainId, daoId))
    if (cached && cached.expiresAt > now) result[daoId] = cached.value
    else misses.push(daoId)
  }

  const redis = getRedisConnection()
  if (redis && misses.length) {
    try {
      const values = await redis.mget(misses.map((daoId) => daoKey(chainId, daoId)))
      const stillMissing: string[] = []
      misses.forEach((daoId, i) => {
        const value = values[i]
        if (value === null || value === undefined) {
          stillMissing.push(daoId)
          return
        }
        const status = JSON.parse(value) as AuctionStatus | null
        result[daoId] = status
        daoCache.set(daoKey(chainId, daoId), {
          value: status,
          expiresAt: now + CACHE_CONFIG.DAO_TTL_MS,
        })
      })
      misses = stillMissing
    } catch (err) {
      console.warn('Redis auction status read error:', err)
    }
  }

  if (!misses.length) return result

  const { auctions } = await daosAuctionStatusRequest(chainId, misses)

  for (const daoId of misses) {
    const status = auctions[daoId] ?? null
    result[daoId] = status
    daoCache.set(daoKey(chainId, daoId), {
      value: status,
      expiresAt: now + CACHE_CONFIG.DAO_TTL_MS,
    })
  }

  if (redis) {
    try {
      const pipeline = redis.pipeline()
      for (const daoId of misses) {
        pipeline.set(
          daoKey(chainId, daoId),
          JSON.stringify(result[daoId]),
          'PX',
          CACHE_CONFIG.DAO_TTL_MS
        )
      }
      await pipeline.exec()
    } catch (err) {
      console.warn('Redis auction status write error:', err)
    }
  }

  return result
}

/**
 * Auction status for a set of DAOs (lowercase token addresses) on one chain.
 */
export async function getAuctionStatuses(
  chainId: CHAIN_ID,
  daoIds: string[]
): Promise<AuctionStatusesResult> {
  const snapshot = await getLiveAuctionSnapshot(chainId)
  const auctions: Record<string, AuctionStatus | null> = {}
  const missing: string[] = []

  for (const daoId of daoIds) {
    const live = snapshot.auctions[daoId]
    if (live) auctions[daoId] = live
    else missing.push(daoId)
  }

  if (missing.length) {
    try {
      Object.assign(auctions, await getFallbackStatuses(chainId, missing))
    } catch (error) {
      console.error('Failed to fetch DAO auction status:', { chainId, error })
      // Leave missing DAOs out rather than reporting them as having no auction
      return { syncedBlock: snapshot.syncedBlock, stale: true, auctions }
    }
  }

  return { syncedBlock: snapshot.syncedBlock, stale: snapshot.stale, auctions }
}

/** Test helper: clear in-process caches */
export function __resetAuctionStatusCache() {
  snapshotCache.clear()
  lastGoodSnapshot.clear()
  daoCache.clear()
  inflightSnapshot.clear()
}
