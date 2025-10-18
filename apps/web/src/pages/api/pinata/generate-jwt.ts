import type { NextApiRequest, NextApiResponse } from 'next'
import { generateUploadJWT } from 'src/services/pinataService'
import { withErrorHandling } from 'src/utils/api/error'

const handler = withErrorHandling(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const result = await generateUploadJWT()
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.status(200).json(result)
})

export default handler
