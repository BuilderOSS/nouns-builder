import { CHAIN_ID } from '@buildeross/types'
import { isOwnerOfSafe } from '@buildeross/utils/safeService'
import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import type { Address } from 'viem'
import { verifyMessage } from 'viem'
import { parseSiweMessage, type SiweMessage } from 'viem/siwe'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
      try {
        const { message, signature, safeAddress, safeChainId } = req.body
        const siweMessage = parseSiweMessage(message) as SiweMessage
        const eoaAddress = siweMessage.address

        // Verify the EOA's signature
        const valid = await verifyMessage({
          address: eoaAddress,
          message,
          signature,
        })

        if (!valid) throw new Error('Invalid signature.')

        const session = await getIronSession<IronSessionData>(req, res, ironOptions)

        if (siweMessage.nonce !== session.nonce)
          return res.status(422).json({ message: 'Invalid nonce.' })

        // If safeAddress provided, verify ownership relationship
        if (safeAddress && safeChainId) {
          const isOwner = await isOwnerOfSafe(
            eoaAddress as Address,
            safeAddress as Address,
            safeChainId as CHAIN_ID
          )

          if (!isOwner) {
            return res.status(403).json({
              message: 'Not authorized as owner for this Safe',
            })
          }

          // Store both EOA address and Safe address in session
          session.eoaAddress = eoaAddress as Address
          session.safeAddress = safeAddress as Address
          session.safeChainId = safeChainId as number

          // Store SIWE message with original EOA address
          session.siwe = siweMessage
        } else {
          // Normal EOA authentication
          session.siwe = siweMessage
        }

        await session.save()
        res.json({ ok: true })
      } catch (error) {
        console.error('Verification error:', error)
        res.json({ ok: false })
      }
      break
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).end(`Method ${method} Not Allowed`)
  }
}

export default withRateLimit({
  maxRequests: 10,
  windowSeconds: 60,
  keyPrefix: 'siwe:verify',
})(handler)
