import { EAS_GRAPHQL_URL } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { GraphQLClient } from 'graphql-request'

import { getSdk } from './sdk.generated'

const globalForClient = global as unknown as {
  subgraphClient: Map<CHAIN_ID, GraphQLClient>
}

export class SDK {
  static connect(chainId: CHAIN_ID) {
    if (!globalForClient.subgraphClient) globalForClient.subgraphClient = new Map()

    const graphqlUrl = EAS_GRAPHQL_URL[chainId]

    if (!graphqlUrl) throw new Error(`No eas graphql url for chain ${chainId}`)

    const client = globalForClient.subgraphClient.has(chainId)
      ? globalForClient.subgraphClient.get(chainId)!
      : new GraphQLClient(graphqlUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

    if (process.env.NODE_ENV !== 'production')
      globalForClient.subgraphClient.set(chainId, client)

    return getSdk(client)
  }
}
