import { CHAIN_ID } from '@buildeross/types'

import { SDK } from '../client'

type SubgraphStatus = {
  syncedBlockNumber: number
  hasIndexingErrors: boolean
}

// Concurrent callers on the same chain share one in-flight request, so
// parallel waits don't multiply load against the subgraph rate limit.
const inflightSyncStatus = new Map<CHAIN_ID, Promise<SubgraphStatus>>()

const fetchSyncStatus = async (chainId: CHAIN_ID): Promise<SubgraphStatus> => {
  try {
    const data = await SDK.connect(chainId).syncStatus()
    return {
      // eslint-disable-next-line no-underscore-dangle
      syncedBlockNumber: data?._meta?.block?.number ?? 0,
      // eslint-disable-next-line no-underscore-dangle
      hasIndexingErrors: data?._meta?.hasIndexingErrors ?? false,
    }
  } catch (error) {
    console.error('Failed to get subgraph status:', error)
    try {
      const sentry = (await import('@sentry/nextjs')) as typeof import('@sentry/nextjs')
      sentry.captureException(error)
      sentry.flush(2000).catch(() => {})
    } catch (_) {}
    return { syncedBlockNumber: 0, hasIndexingErrors: false }
  }
}

export const getSyncStatus = (chainId: CHAIN_ID): Promise<SubgraphStatus> => {
  const inflight = inflightSyncStatus.get(chainId)
  if (inflight) return inflight

  const promise = fetchSyncStatus(chainId).finally(() => {
    inflightSyncStatus.delete(chainId)
  })
  inflightSyncStatus.set(chainId, promise)
  return promise
}

const RECHECK_INTERVAL = 2000
const NUM_RETRIES = 10
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const awaitSubgraphSync = async (
  chainId: CHAIN_ID,
  transactionBlockNumber: bigint
) => {
  let status = await getSyncStatus(chainId)
  let tries = 0
  while (status.syncedBlockNumber < transactionBlockNumber && tries < NUM_RETRIES) {
    // eslint-disable-next-line no-await-in-loop
    await delay(RECHECK_INTERVAL)
    tries += 1
    status = await getSyncStatus(chainId)
  }
  return status.syncedBlockNumber >= transactionBlockNumber
}
