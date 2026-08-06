import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import { SIWE_NONCE_RATE_LIMIT_KEY_PREFIX } from 'src/utils/siweAuthFlow'
import { generateSiweNonce } from 'viem/siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'GET':
      const session = await getIronSession<IronSessionData>(req, res, ironOptions)
      session.nonce = generateSiweNonce()
      await session.save()
      res.setHeader('Content-Type', 'text/plain')
      res.send(session.nonce)
      break
    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withRateLimit({
  maxRequests: 30,
  windowSeconds: 60,
  keyPrefix: SIWE_NONCE_RATE_LIMIT_KEY_PREFIX,
})(handler)
