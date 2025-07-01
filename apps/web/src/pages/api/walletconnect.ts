import type { NextApiRequest, NextApiResponse } from 'next'

import { WALLET_CONNECT_METADATA } from 'src/constants/walletconnect'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end()
    return
  }

  res.status(200).send(WALLET_CONNECT_METADATA)
}
