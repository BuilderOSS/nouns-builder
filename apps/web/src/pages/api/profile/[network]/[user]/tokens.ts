import { NextApiRequest, NextApiResponse } from 'next'
import { getAddress } from 'viem'

import { PUBLIC_DEFAULT_CHAINS } from 'src/constants/defaultChains'
import { MyDaosResponse, myDaosRequest } from 'src/data/subgraph/requests/daoQuery'
import { TokensQueryResponse, tokensQuery } from 'src/data/subgraph/requests/tokensQuery'
import { NotFoundError } from 'src/services/errors'

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

export default handler
