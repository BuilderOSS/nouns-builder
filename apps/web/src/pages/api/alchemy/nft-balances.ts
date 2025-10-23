import { PUBLIC_IS_TESTNET } from '@buildeross/constants'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCachedNFTBalance } from 'src/services/alchemyService'
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
    const options = {
      filterSpam: PUBLIC_IS_TESTNET ? false : true,
      useCache: true,
    }
    const result = await getCachedNFTBalance(
      chainIdNum as CHAIN_ID,
      address as AddressType,
      options
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
    console.error('NFT balances API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors(['GET'])(
  withRateLimit({
    keyPrefix: 'alchemy:nftBalances',
  })(handler)
)
