import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { clientConfig } from 'src/utils/clientConfig'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import { parseSiweMessage, type SiweMessage, verifySiweMessage } from 'viem/siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
      try {
        const { message, signature } = req.body
        const siweMessage = parseSiweMessage(message) as SiweMessage

        const valid = await verifySiweMessage(clientConfig.getClient(), {
          address: siweMessage.address,
          message,
          signature,
        })

        if (!valid) throw new Error('Invalid signature.')

        const session = await getIronSession<IronSessionData>(req, res, ironOptions)

        if (siweMessage.nonce !== session.nonce)
          return res.status(422).json({ message: 'Invalid nonce.' })

        session.siwe = siweMessage
        await session.save()
        res.json({ ok: true })
      } catch (_error) {
        res.json({ ok: false })
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default handler
