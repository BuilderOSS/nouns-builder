import type { NextApiRequest, NextApiResponse } from 'next'
import { pinCidToIPFS } from 'src/services/pinataService'
import { type AuthContext, withAuth } from 'src/utils/api/authMiddleware'
import { withErrorHandling } from 'src/utils/api/error'
import { withRateLimit } from 'src/utils/api/rateLimit'

const handler = withErrorHandling(
  withRateLimit({
    maxRequests: 15,
    windowSeconds: 60,
    keyPrefix: 'pinata:pin-cid',
  })(
    withAuth(
      async (req: NextApiRequest, res: NextApiResponse, _authContext: AuthContext) => {
        if (req.method !== 'POST') {
          res.setHeader('Allow', ['POST'])
          return res.status(405).end(`Method ${req.method} Not Allowed`)
        }

        const { cid, name, group_id } = req.body
        const result = await pinCidToIPFS({ cid, name, group_id })
        return res.status(200).json({ text: result.status })
      }
    )
  )
)

export default handler
