import { EAS_GRAPHQL_URL } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { GraphQLClient } from 'graphql-request'

import { getSdk } from './sdk.generated'

type ClientCache = Map<CHAIN_ID, GraphQLClient>

export class SDK {
  private static clientCache: ClientCache = new Map()

  static connect(chainId: CHAIN_ID, options?: { useCache?: boolean }) {
    const useCache = options?.useCache ?? true
    const graphqlUrl = EAS_GRAPHQL_URL[chainId]

    if (!graphqlUrl) {
      throw new Error(`No EAS GraphQL URL found for chain ID ${chainId}`)
    }

    // Use cached client if applicable
    if (useCache && this.clientCache.has(chainId)) {
      return getSdk(this.clientCache.get(chainId)!)
    }

    const client = new GraphQLClient(graphqlUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (useCache) {
      this.clientCache.set(chainId, client)
    }

    return getSdk(client)
  }

  /** Optional: clear the internal client cache (useful for tests or resetting state) */
  static clearCache() {
    this.clientCache.clear()
  }
}
