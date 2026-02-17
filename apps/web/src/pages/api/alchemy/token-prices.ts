import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCachedTokenPrices } from 'src/services/alchemyService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, addresses } = req.query

  if (!chainId) {
    return res.status(400).json({ error: 'Missing chainId parameter' })
  }

  if (!addresses) {
    return res.status(400).json({ error: 'Missing addresses parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  // Parse addresses - can be comma-separated or array
  let addressArray: string[]
  if (Array.isArray(addresses)) {
    addressArray = addresses
  } else {
    addressArray = (addresses as string).split(',').map((addr) => addr.trim())
  }

  if (addressArray.length === 0) {
    return res.status(400).json({ error: 'No addresses provided' })
  }

  // Limit to 25 addresses per request (Alchemy API batch limit)
  if (addressArray.length > 25) {
    return res.status(400).json({ error: 'Maximum 25 addresses allowed per request' })
  }

  try {
    const result = await getCachedTokenPrices(
      chainIdNum as CHAIN_ID,
      addressArray as `0x${string}`[]
    )

    // Handle null result (unsupported chain or missing API key)
    if (!result) {
      return res.status(200).json({
        data: [],
        source: 'fetched',
      })
    }

    // Data is already sanitized by the service
    return res.status(200).json({
      data: result.data,
      source: result.source,
    })
  } catch (error) {
    console.error('Token prices API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'alchemy:tokenPrices',
  })(handler)
)
