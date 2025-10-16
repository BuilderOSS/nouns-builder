import { AddressType, CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCachedNftMetadata } from 'src/services/alchemyService'
import { isAddress } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chainId, contractAddress, tokenId } = req.query

  if (!chainId || !contractAddress || !tokenId) {
    return res
      .status(400)
      .json({ error: 'Missing chainId, contractAddress or tokenId parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isAddress(contractAddress as string)) {
    return res.status(400).json({ error: 'Invalid contract address' })
  }

  if (!/^\d+$/.test(tokenId as string)) {
    return res.status(400).json({ error: 'Invalid token ID' })
  }

  try {
    const result = await getCachedNftMetadata(
      chainIdNum as CHAIN_ID,
      contractAddress as AddressType,
      tokenId as string
    )

    // Handle null result (unsupported chain or missing API key)
    if (!result) {
      return res.status(200).json({
        data: null,
        source: 'fetched',
      })
    }

    // Data is already sanitized by the service
    return res.status(200).json({
      data: result.data,
      source: result.source,
    })
  } catch (error) {
    console.error('NFT metadata API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
