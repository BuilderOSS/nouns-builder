import { CHAIN_ID } from '@buildeross/types'
import { GraphQLClient } from 'graphql-request'

import { PUBLIC_SUBGRAPH_URL } from 'src/constants/subgraph'

import { getSdk } from './sdk.generated'

const globalForClient = global as unknown as {
  subgraphClient: Map<CHAIN_ID, GraphQLClient>
}

export class SDK {
  static connect(chainId: CHAIN_ID) {
    if (!globalForClient.subgraphClient) globalForClient.subgraphClient = new Map()

    const subgraphUrl = PUBLIC_SUBGRAPH_URL.get(chainId)

    if (!subgraphUrl) throw new Error('No subgraph url for chain id')

    const client = globalForClient.subgraphClient.has(chainId)
      ? globalForClient.subgraphClient.get(chainId)!
      : new GraphQLClient(subgraphUrl, {
          headers: {
            'Content-Type': 'application/json',
          },
        })

    if (process.env.NODE_ENV !== 'production')
      globalForClient.subgraphClient.set(chainId, client)

    return getSdk(client)
  }
}
