import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { ironOptions, type IronSessionData } from 'src/utils/iron'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'GET':
      const session = await getIronSession<IronSessionData>(req, res, ironOptions)
      res.send({
        address: session.siwe?.address,
        eoaAddress: session.eoaAddress,
        safeAddress: session.safeAddress,
        safeChainId: session.safeChainId,
      })
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withRateLimit({
  maxRequests: 120,
  windowSeconds: 60,
  keyPrefix: 'siwe:me',
})(handler)
