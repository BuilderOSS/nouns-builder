import type { NextApiRequest, NextApiResponse } from 'next'
import { generateUploadJWT } from 'src/services/pinataService'
import { withAuth } from 'src/utils/api/authMiddleware'
import { withErrorHandling } from 'src/utils/api/error'
import { withRateLimit } from 'src/utils/api/rateLimit'

const handler = withErrorHandling(
  withRateLimit({
    maxRequests: 20,
    windowSeconds: 60,
    keyPrefix: 'pinata:generate-jwt',
  })(
    withAuth(async (req: NextApiRequest, res: NextApiResponse, _session) => {
      if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
      }

      const result = await generateUploadJWT()
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.status(200).json(result)
    })
  )
)

export default handler
