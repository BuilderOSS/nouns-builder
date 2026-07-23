import type { NextApiRequest, NextApiResponse } from 'next'
import { pinCidToIPFS } from 'src/services/pinataService'
import { withAuth } from 'src/utils/api/authMiddleware'
import { withErrorHandling } from 'src/utils/api/error'

const handler = withErrorHandling(
  withAuth(async (req: NextApiRequest, res: NextApiResponse, _session) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const { cid, name, group_id } = req.body
    const result = await pinCidToIPFS({ cid, name, group_id })
    return res.status(200).json({ text: result.status })
  })
)

export default handler
