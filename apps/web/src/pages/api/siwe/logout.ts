import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { ironOptions, type IronSessionData } from 'src/utils/iron'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
    case 'GET':
      const session = await getIronSession<IronSessionData>(req, res, ironOptions)
      session.destroy()
      res.send({ ok: true })
      break
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
