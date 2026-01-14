import { AddressType, CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getEnrichedPinnedAssets, PinnedAssetInput } from 'src/services/alchemyService'
import { withCors } from 'src/utils/api/cors'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { isAddress } from 'viem'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chainId, treasuryAddress, pinnedAssets } = req.body

  if (!chainId || !treasuryAddress || !Array.isArray(pinnedAssets)) {
    return res.status(400).json({
      error: 'Missing chainId, treasuryAddress, or pinnedAssets array',
    })
  }

  const chainIdNum = parseInt(chainId, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isAddress(treasuryAddress)) {
    return res.status(400).json({ error: 'Invalid treasury address' })
  }

  // Validate pinned assets structure
  for (const asset of pinnedAssets as PinnedAssetInput[]) {
    if (
      typeof asset.tokenType !== 'number' ||
      asset.tokenType > 2 ||
      asset.tokenType < 0
    ) {
      return res.status(400).json({ error: 'Invalid tokenType' })
    }
    if (!isAddress(asset.token)) {
      return res.status(400).json({ error: 'Invalid token address' })
    }
    if (asset.tokenType !== 0 && !asset.isCollection && !asset.tokenId) {
      return res.status(400).json({
        error: 'NFTs must specify tokenId or isCollection',
      })
    }
  }

  try {
    const result = await getEnrichedPinnedAssets(
      chainIdNum as CHAIN_ID,
      treasuryAddress as AddressType,
      pinnedAssets as PinnedAssetInput[]
    )

    return res.status(200).json({
      data: result,
      source: 'fetched',
    })
  } catch (error) {
    console.error('Alchemy pinned assets API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

export default withCors({
  allowedMethods: ['POST'],
})(
  withRateLimit({
    keyPrefix: 'alchemy:pinnedAssets',
  })(handler)
)
