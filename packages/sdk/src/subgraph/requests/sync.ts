import { CHAIN_ID } from '@buildeross/types'
import * as Sentry from '@sentry/nextjs'

import { SDK } from '../client'

type SubgraphStatus = {
  syncedBlockNumber: number
  hasIndexingErrors: boolean
}

export const getSyncStatus = async (chainId: CHAIN_ID): Promise<SubgraphStatus> => {
  try {
    return SDK.connect(chainId)
      .syncStatus()
      .then((data) => {
        const status = {
          // eslint-disable-next-line no-underscore-dangle
          syncedBlockNumber: data?._meta?.block?.number ?? 0,
          // eslint-disable-next-line no-underscore-dangle
          hasIndexingErrors: data?._meta?.hasIndexingErrors ?? false,
        }
        return status
      })
  } catch (error) {
    console.error('Failed to get subgraph status:', error)
    Sentry.captureException(error)
    await Sentry.flush(2000)
    return { syncedBlockNumber: 0, hasIndexingErrors: false }
  }
}

const RECHECK_INTERVAL = 2000
const NUM_RETRIES = 10
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const awaitSubgraphSync = async (
  chainId: CHAIN_ID,
  transactionBlockNumber: bigint,
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
