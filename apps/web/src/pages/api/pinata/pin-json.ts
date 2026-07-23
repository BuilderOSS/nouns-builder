import type { NextApiRequest, NextApiResponse } from 'next'
import { pinJsonToIPFS } from 'src/services/pinataService'
import { withAuth } from 'src/utils/api/authMiddleware'
import { withErrorHandling } from 'src/utils/api/error'

const handler = withErrorHandling(
  withAuth(async (req: NextApiRequest, res: NextApiResponse, _session) => {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const result = await pinJsonToIPFS(req.body)
    return res.status(200).json(result)
  })
)

export default handler
