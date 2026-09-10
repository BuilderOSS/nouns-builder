import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSplitInfo } from 'src/services/splitsService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, address } = req.query

  if (!chainId || !address) {
    return res.status(400).json({ error: 'Missing chainId or address parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isAddress(address as string)) {
    return res.status(400).json({ error: 'Invalid address' })
  }

  try {
    const result = await getSplitInfo(chainIdNum as CHAIN_ID, address as string)

    // An immutable split never changes; a mutable one is re-checked against the
    // on-chain hash on every read, so this is safe to cache at the edge too.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json({ data: result })
  } catch (error) {
    console.error('Splits API error:', error)
    return res.status(500).json({ error: 'Failed to load split' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'splits:info',
  })(handler)
)
