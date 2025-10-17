import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import {
  myDaosRequest,
  MyDaosResponse,
  tokensQuery,
  TokensQueryResponse,
} from '@buildeross/sdk/subgraph'
import { NextApiRequest, NextApiResponse } from 'next'
import { NotFoundError } from 'src/services/errors'
import { withCors } from 'src/utils/cors'
import { getAddress } from 'viem'

export interface UserTokensResponse {
  tokens?: TokensQueryResponse
  daos: MyDaosResponse
}

export const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { user, page, network } = req.query

  const chain = PUBLIC_DEFAULT_CHAINS.find((x) => x.slug === network)

  if (!chain) return res.status(400).json({ error: 'bad network input' })

  let address: string

  try {
    address = getAddress(user as string)
  } catch (e) {
    return res.status(400).json({ error: 'bad address input' })
  }

  try {
    const daos = await myDaosRequest(address)
    if (!daos || daos.length < 1)
      return res.status(200).json({
        daos: [],
      })

    const tokens = await tokensQuery(
      chain.id,
      address,
      page ? parseInt(page as string) : undefined
    )

    res.status(200).json({ tokens, daos } as UserTokensResponse)
  } catch (e) {
    if (e instanceof NotFoundError) {
      return res.status(404).json({ error: 'tokens not found' })
    }

    return res.status(500).json({ error: 'backend failed' })
  }
}

export default withCors(['GET'])(handler)
