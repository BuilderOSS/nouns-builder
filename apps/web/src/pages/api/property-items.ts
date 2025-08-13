import { getPropertyItems } from '@buildeross/sdk'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { NextApiRequest, NextApiResponse } from 'next'
import { isAddress } from 'viem'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { chainId, metadataAddress } = req.query

  if (!chainId || !metadataAddress) {
    return res.status(400).json({ error: 'Missing chainId or metadataAddress parameter' })
  }

  const chainIdNum = parseInt(chainId as string, 10)

  if (!Object.values(CHAIN_ID).includes(chainIdNum)) {
    return res.status(400).json({ error: 'Invalid chainId' })
  }

  if (!isAddress(metadataAddress as string)) {
    return res.status(400).json({ error: 'Invalid metadata address' })
  }

  try {
    const result = await getPropertyItems(
      chainIdNum as CHAIN_ID,
      metadataAddress as AddressType
    )

    return res.status(200).json(result)
  } catch (error) {
    console.error('Property items API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
