import { AddressType, CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCachedNFTBalance } from 'src/services/alchemyService'
import { isAddress } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

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
    const result = await getCachedNFTBalance(
      chainIdNum as CHAIN_ID,
      address as AddressType
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
