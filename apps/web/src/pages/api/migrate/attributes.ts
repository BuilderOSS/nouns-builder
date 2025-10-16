import { getMetadataAttributes } from '@buildeross/sdk/contract'
import { NextApiRequest, NextApiResponse } from 'next'
import { Address } from 'viem'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  // Set CORS headers to allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    const { metadata, chainId, finalTokenId } = req.query as {
      metadata: Address
      chainId: string
      finalTokenId: string
    }

    const attribtues = await getMetadataAttributes(
      metadata as Address,
      BigInt(finalTokenId),
      parseInt(chainId)
    )

    res.status(200).send(attribtues)
  } catch (e) {
    res.status(500).send(e)
  }
}

export default handler
