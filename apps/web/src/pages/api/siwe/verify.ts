import { CHAIN_ID } from '@buildeross/types'
import { isDelegateForSafe } from '@buildeross/utils/safeService'
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
        const delegateAddress = siweMessage.address

        // Verify the delegate's signature (EOA signature)
        const valid = await verifyMessage({
          address: delegateAddress,
          message,
          signature,
        })

        if (!valid) throw new Error('Invalid signature.')

        const session = await getIronSession<IronSessionData>(req, res, ironOptions)

        if (siweMessage.nonce !== session.nonce)
          return res.status(422).json({ message: 'Invalid nonce.' })

        // If safeAddress provided, verify delegation relationship
        if (safeAddress && safeChainId) {
          const isDelegate = await isDelegateForSafe(
            delegateAddress as Address,
            safeAddress as Address,
            safeChainId as CHAIN_ID
          )

          if (!isDelegate) {
            return res.status(403).json({
              message: 'Not authorized as delegate for this Safe',
            })
          }

          // Store both addresses in session
          session.delegateAddress = delegateAddress as Address
          session.safeAddress = safeAddress as Address
          session.safeChainId = safeChainId as number

          // Modify siwe message to use Safe address for authorization
          session.siwe = {
            ...siweMessage,
            address: safeAddress as Address,
          }
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
