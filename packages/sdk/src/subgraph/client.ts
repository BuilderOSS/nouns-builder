import { PUBLIC_SUBGRAPH_URL } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { GraphQLClient } from 'graphql-request'

import { getSdk } from './sdk.generated'

type ClientCache = Map<CHAIN_ID, GraphQLClient>

export class SDK {
  private static clientCache: ClientCache = new Map()

  static connect(chainId: CHAIN_ID, options?: { useCache?: boolean }) {
    const useCache = options?.useCache ?? true
    const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)

    if (!subgraphUrl) {
      throw new Error(`No subgraph URL found for chain ID ${chainId}`)
    }

    // Return from cache if enabled
    if (useCache && this.clientCache.has(chainId)) {
      return getSdk(this.clientCache.get(chainId)!)
    }

    const client = new GraphQLClient(subgraphUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (useCache) {
      this.clientCache.set(chainId, client)
    }

    return getSdk(client)
  }

  /** Optional: Clear internal cache, useful for tests or reinitialization */
  static clearCache() {
    this.clientCache.clear()
  }
}
