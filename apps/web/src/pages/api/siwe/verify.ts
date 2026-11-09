import { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { isOwnerOfSafe, isSafeServiceError } from '@buildeross/utils/safeService'
import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { withSameOrigin } from 'src/utils/api/sameOrigin'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import {
  SIWE_NONCE_TTL_MS,
  SIWE_VERIFY_RATE_LIMIT_KEY_PREFIX,
} from 'src/utils/siweAuthFlow'
import type { Address, Hex } from 'viem'
import { isHex } from 'viem'
import { parseSiweMessage, type SiweMessage, validateSiweMessage } from 'viem/siwe'

/**
 * The message must name this host as its domain and point its URI at it, and
 * must be within its own expirationTime/notBefore window if it sets one.
 */
function isMessageForThisSite(
  message: Partial<SiweMessage>,
  host: string | undefined
): boolean {
  if (!host || !message.uri) return false
  if (!validateSiweMessage({ message, domain: host })) return false

  try {
    return new URL(message.uri).host === host
  } catch {
    return false
  }
}

/**
 * Normalizes signature format for compatibility across different wallets
 * Supports both EOA signatures (65 bytes) and smart contract wallet signatures (EIP-1271)
 */
function normalizeSignature(signature: string): Hex {
  let normalized = signature.trim()

  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = `0x${normalized}`
  }

  // Validate it's a hex string
  if (!isHex(normalized)) {
    throw new Error(
      `Signature is not a valid hex string: ${normalized.substring(0, 20)}...`
    )
  }

  return normalized as Hex
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
      try {
        const { message, signature, safeAddress, safeChainId } = req.body
        const siweMessage = parseSiweMessage(message) as SiweMessage
        // The SIWE address is the owner wallet, which can be an EOA or an EIP-1271 contract.
        const ownerAddress = siweMessage.address

        // Bind the message to this site. Without this, a message signed on
        // another site (carrying a nonce the attacker fetched for their own
        // cookie) would be accepted here. Also honours expirationTime/notBefore
        // if the message has them.
        if (!isMessageForThisSite(siweMessage, req.headers.host)) {
          return res.status(400).json({
            ok: false,
            message: 'This sign-in request was not created for this site.',
          })
        }

        // Normalize signature to handle wallet-specific formats
        const normalizedSignature = normalizeSignature(signature)

        // Get the provider for this chain (cached PublicClient)
        const chainId = siweMessage.chainId as CHAIN_ID
        const provider = getProvider(chainId)

        // Verify against the owner wallet (automatically handles EOAs and EIP-1271 wallets).
        // - EOA wallets: Uses ECDSA recovery (65-byte signatures)
        // - Smart contract wallets: Uses EIP-1271 isValidSignature (variable length)
        const valid = await provider.verifyMessage({
          address: ownerAddress,
          message,
          signature: normalizedSignature,
        })

        if (!valid) throw new Error('Invalid signature.')

        const session = await getIronSession<IronSessionData>(req, res, ironOptions)

        if (!session.nonce || siweMessage.nonce !== session.nonce) {
          return res.status(422).json({ message: 'Invalid nonce.' })
        }

        // Expire sign-in attempts by when the nonce was issued (server clock),
        // so a wrong client clock can't lock users out.
        if (
          !session.nonceIssuedAt ||
          Date.now() - session.nonceIssuedAt > SIWE_NONCE_TTL_MS
        ) {
          return res.status(422).json({ message: 'Nonce expired.' })
        }

        // If safeAddress provided, verify ownership relationship
        if (safeAddress && safeChainId) {
          let isOwner: boolean
          try {
            isOwner = await isOwnerOfSafe(
              ownerAddress as Address,
              safeAddress as Address,
              safeChainId as CHAIN_ID
            )
          } catch (error) {
            if (!isSafeServiceError(error)) throw error
            // Don't report a Safe API outage or rate limit as "not an owner".
            console.error('Safe ownership lookup failed:', error)
            return res.status(503).json({
              ok: false,
              message:
                'Could not reach the Safe service to confirm ownership. Please try again in a moment.',
            })
          }

          if (!isOwner) {
            return res.status(403).json({
              message: 'Not authorized as owner for this Safe',
            })
          }

          // Store both owner wallet and Safe address in session.
          session.ownerAddress = ownerAddress as Address
          session.safeAddress = safeAddress as Address
          session.safeChainId = safeChainId as number

          // Store the SIWE message with the original owner wallet address.
          session.siwe = siweMessage
        } else {
          // Normal wallet authentication.
          delete session.ownerAddress
          delete session.safeAddress
          delete session.safeChainId
          session.siwe = siweMessage
        }

        delete session.nonce
        delete session.nonceIssuedAt
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
  keyPrefix: SIWE_VERIFY_RATE_LIMIT_KEY_PREFIX,
})(withSameOrigin(handler))
