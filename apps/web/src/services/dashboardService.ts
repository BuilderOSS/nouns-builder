import { PUBLIC_IS_TESTNET } from '@buildeross/constants/chains'
import { getProposalState, ProposalState } from '@buildeross/sdk/contract'
import {
  type DashboardDao as DashboardDaoBase,
  dashboardRequest,
} from '@buildeross/sdk/subgraph'
import { AddressType, BytesType } from '@buildeross/types'
import { executeConcurrently } from '@buildeross/utils/concurrent'
import { keccak256 } from 'viem'

import { getRedisConnection } from './redisConnection'

/**
 * Redis cache configuration
 */
const CACHE_CONFIG = {
  USER_DASHBOARD_TTL: 300, // 5 minutes for user dashboard data
  DASHBOARD_PREFIX: PUBLIC_IS_TESTNET ? 'testnet:dashboard:user' : 'dashboard:user',
} as const

const ACTIVE_PROPOSAL_STATES = [
  ProposalState.Pending,
  ProposalState.Active,
  ProposalState.Succeeded,
  ProposalState.Queued,
]

/**
 * Log helper that respects NODE_ENV
 */
function log(message: string, data?: any) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(message, data || '')
  }
}

/**
 * Generate cache key for user dashboard
 */
function generateCacheKey(address: AddressType): string {
  const hash = keccak256(address).slice(0, 18)
  return `${CACHE_CONFIG.DASHBOARD_PREFIX}:${hash}`
}

/**
 * Fetch proposal state with retry logic
 */
async function fetchProposalStateWithRetry(
  chainId: number,
  governorAddress: AddressType,
  proposalId: BytesType,
  retries = 2
): Promise<ProposalState> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await getProposalState(chainId, governorAddress, proposalId)
    } catch (error: any) {
      if (attempt === retries) {
        throw error
      }
      // Exponential backoff: 100ms, 200ms
      await new Promise((resolve) => setTimeout(resolve, 100 * Math.pow(2, attempt)))
    }
  }
  throw new Error('Failed to fetch proposal state')
}

export type DashboardDaoWithState = Omit<DashboardDaoBase, 'proposals'> & {
  proposals: Array<
    DashboardDaoBase['proposals'][number] & {
      state: ProposalState
    }
  >
}

/**
 * Fetch DAO proposal states with controlled concurrency
 */
async function fetchDaoProposalState(
  dao: DashboardDaoBase
): Promise<DashboardDaoWithState> {
  try {
    // Use controlled concurrency to avoid overwhelming RPC
    const proposalTasks = dao.proposals.map(
      (proposal) => () =>
        fetchProposalStateWithRetry(
          dao.chainId,
          proposal.dao.governorAddress,
          proposal.proposalId
        ).then((state) => ({ ...proposal, state }))
    )

    const proposals = await executeConcurrently(proposalTasks)

    return {
      ...dao,
      proposals: proposals.filter((proposal) =>
        ACTIVE_PROPOSAL_STATES.includes(proposal.state)
      ),
    }
  } catch (error: any) {
    throw new Error(
      error?.message
        ? `RPC Error: ${error.message}`
        : 'Error fetch Dashboard data from RPC'
    )
  }
}

/**
 * Fetch dashboard data (main logic)
 */
async function fetchDashboardData(
  address: AddressType
): Promise<DashboardDaoWithState[]> {
  try {
    const userDaos = await dashboardRequest(address)
    if (!userDaos) throw new Error('Dashboard DAO query returned undefined')

    // Use controlled concurrency for DAO proposal state fetching
    const daoTasks = userDaos.map((dao) => () => fetchDaoProposalState(dao))
    const resolved = await executeConcurrently(daoTasks)

    return resolved
  } catch (error: any) {
    throw new Error(error?.message || 'Error fetching dashboard data')
  }
}

/**
 * Fetch dashboard data with Redis cache
 */
export async function fetchDashboardDataService(
  address: AddressType
): Promise<DashboardDaoWithState[]> {
  const redis = getRedisConnection()
  const cacheKey = generateCacheKey(address)
  const lockKey = `${cacheKey}:lock`
  const startTime = Date.now()

  // Try to get from cache
  if (redis) {
    try {
      const cached = await redis.get(cacheKey)
      if (cached) {
        log('Dashboard cache hit', {
          address,
          duration: Date.now() - startTime,
        })
        return JSON.parse(cached)
      }
    } catch (err) {
      console.warn('Redis cache read error:', err)
    }

    // Cache miss - try to acquire lock to prevent thundering herd
    let lockAcquired = false
    try {
      lockAcquired = (await redis.set(lockKey, '1', 'EX', 30, 'NX')) === 'OK'
    } catch (err) {
      console.warn('Redis lock error:', err)
    }

    if (!lockAcquired) {
      // Another request is fetching, wait briefly and retry cache
      log('Waiting for lock', { address })
      await new Promise((resolve) => setTimeout(resolve, 300))

      try {
        const cached = await redis.get(cacheKey)
        if (cached) {
          log('Dashboard cache hit after wait', { address })
          return JSON.parse(cached)
        }
      } catch (err) {
        console.warn('Redis cache retry error:', err)
      }

      // If still no cache, fall through to fetch
      log('Dashboard cache miss after wait, fetching', { address })
    }
  }

  // Fetch fresh data
  log('Dashboard cache miss, fetching', { address })
  const data = await fetchDashboardData(address)

  // Store in cache
  if (redis) {
    try {
      await redis.setex(cacheKey, CACHE_CONFIG.USER_DASHBOARD_TTL, JSON.stringify(data))
      log('Dashboard cached', {
        address,
        daoCount: data.length,
        ttl: CACHE_CONFIG.USER_DASHBOARD_TTL,
      })
    } catch (err) {
      console.warn('Redis cache write error:', err)
    } finally {
      // Always clean up lock
      try {
        await redis.del(lockKey)
      } catch (_) {}
    }
  }

  return data
}

/**
 * Get TTL for dashboard cache
 */
export function getDashboardTtl(): number {
  return CACHE_CONFIG.USER_DASHBOARD_TTL
}
