import { GraphQLClient } from 'graphql-request'

import { getSdk } from './sdk.generated'

export const client = new GraphQLClient('https://api.zora.co/graphql', {
  headers: {
    'Content-Type': 'application/json',
    ...(!!process.env.NEXT_PUBLIC_ZORA_API_KEY && {
      'X-API-KEY': process.env.NEXT_PUBLIC_ZORA_API_KEY,
    }),
  },
})

export const sdk = getSdk(client)
