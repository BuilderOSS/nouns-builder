import { getMetadataAttributes } from '@buildeross/sdk/contract'
import { NextApiRequest, NextApiResponse } from 'next'
import { withCors } from 'src/utils/api/cors'
import { Address } from 'viem'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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

export default withCors()(handler)
