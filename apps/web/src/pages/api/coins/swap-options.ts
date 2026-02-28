import { buildSwapOptions } from '@buildeross/swap'
import { CHAIN_ID } from '@buildeross/types'
import { isChainIdSupportedByCoining } from '@buildeross/utils/coining'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

/**
 * Serialize a SwapOption for JSON transport.
 * Converts bigint fields (fee) to strings so JSON.stringify doesn't throw.
 */
function serializeSwapOptions(
  result: NonNullable<Awaited<ReturnType<typeof buildSwapOptions>>>
) {
  return {
    options: result.options.map((opt) => ({
      ...opt,
      token: {
        ...opt.token,
        fee:
          opt.token.type === 'zora-coin' || opt.token.type === 'clanker-token'
            ? opt.token.fee.toString()
            : undefined,
      },
      path: {
        ...opt.path,
        hops: opt.path.hops.map((hop) => ({
          ...hop,
          fee: hop.fee !== undefined ? hop.fee.toString() : undefined,
        })),
        estimatedGas:
          opt.path.estimatedGas !== undefined
            ? opt.path.estimatedGas.toString()
            : undefined,
      },
    })),
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, coinAddress, isBuying } = req.query

  if (!chainId || !coinAddress) {
    return res.status(400).json({ error: 'Missing chainId or coinAddress parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isChainIdSupportedByCoining(chainIdNum as CHAIN_ID)) {
    return res.status(400).json({ error: 'Chain not supported for swap options' })
  }

  if (!isAddress(coinAddress as string)) {
    return res.status(400).json({ error: 'Invalid coinAddress' })
  }

  const buying = isBuying !== 'false'

  try {
    const result = await buildSwapOptions(
      chainIdNum as CHAIN_ID,
      coinAddress as `0x${string}`,
      buying
    )

    if (!result) {
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10')
      return res.status(200).json({ options: [] })
    }

    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=10')
    return res.status(200).json(serializeSwapOptions(result))
  } catch (error) {
    console.error('Swap options API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors()(
  withRateLimit({
    maxRequests: 60,
    keyPrefix: 'coins:swapOptions',
  })(handler)
)
