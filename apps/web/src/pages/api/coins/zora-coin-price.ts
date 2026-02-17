import { CHAIN_ID } from '@buildeross/types'
import { isCoinSupportedChain } from '@buildeross/utils/helpers'
import { NextApiRequest, NextApiResponse } from 'next'
import { getZoraCoinUsdPrice } from 'src/services/coinPriceService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, coinAddress, ethUsdPrice } = req.query

  if (!chainId || !coinAddress) {
    return res.status(400).json({ error: 'Missing chainId or coinAddress parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isCoinSupportedChain(chainIdNum as CHAIN_ID)) {
    return res.status(400).json({ error: 'Chain not supported for coin pricing' })
  }

  if (!isAddress(coinAddress as string)) {
    return res.status(400).json({ error: 'Invalid coinAddress' })
  }

  const clientEthUsdPrice = ethUsdPrice ? parseFloat(ethUsdPrice as string) : undefined
  const resolvedEthUsdPrice =
    clientEthUsdPrice !== undefined && !isNaN(clientEthUsdPrice) && clientEthUsdPrice > 0
      ? clientEthUsdPrice
      : undefined

  try {
    const priceUsd = await getZoraCoinUsdPrice(
      coinAddress as string,
      chainIdNum as CHAIN_ID,
      resolvedEthUsdPrice
    )

    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=5')
    return res.status(200).json({ priceUsd })
  } catch (error) {
    console.error('Zora coin price API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60,
    keyPrefix: 'coins:zoraCoinPrice',
  })(handler)
)
