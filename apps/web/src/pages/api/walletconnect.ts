import { WALLET_CONNECT_METADATA } from '@buildeross/constants/walletconnect'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'

function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).send(WALLET_CONNECT_METADATA)
}

export default withCors()(handler)
