import { PUBLIC_IS_TESTNET } from '@buildeross/constants'
import { CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getEnrichedTokenBalances } from 'src/services/alchemyService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'

const parseBooleanParam = (value: string | string[] | undefined): boolean | undefined => {
  if (typeof value !== 'string') return undefined
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, address } = req.query

  if (!chainId || !address) {
    return res.status(400).json({ error: 'Missing chainId or address parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  try {
    const filterLowValue =
      parseBooleanParam(req.query.filterLowValue) ?? (PUBLIC_IS_TESTNET ? false : true)

    const result = await getEnrichedTokenBalances(
      chainIdNum as CHAIN_ID,
      address as `0x${string}`,
      { filterLowValue }
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
    console.error('Token balances API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    keyPrefix: 'alchemy:tokenBalances',
  })(handler)
)
