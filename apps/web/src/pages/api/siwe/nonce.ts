import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
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

export default handler
