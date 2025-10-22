import { WALLET_CONNECT_METADATA } from '@buildeross/constants/walletconnect'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'

function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  res.status(200).send(WALLET_CONNECT_METADATA)
}

export default withCors(['GET'])(handler)
