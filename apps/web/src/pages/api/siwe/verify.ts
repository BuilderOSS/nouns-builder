import { CHAIN_ID } from '@buildeross/types'
import { getProvider } from '@buildeross/utils/provider'
import { isOwnerOfSafe } from '@buildeross/utils/safeService'
import { getIronSession } from 'iron-session'
import type { NextApiRequest, NextApiResponse } from 'next'
import { withRateLimit } from 'src/utils/api/rateLimit'
import { ironOptions, type IronSessionData } from 'src/utils/iron'
import { SIWE_VERIFY_RATE_LIMIT_KEY_PREFIX } from 'src/utils/siweAuthFlow'
import type { Address, Hex } from 'viem'
import { hexToBytes, isHex, size } from 'viem'
import { parseSiweMessage, type SiweMessage } from 'viem/siwe'

/**
 * Normalizes signature format for compatibility across different wallets
 * Supports both EOA signatures (65 bytes) and smart contract wallet signatures (EIP-1271)
 */
function normalizeSignature(signature: string): Hex {
  console.log('📝 Raw signature received:', {
    signature: signature.substring(0, 20) + '...',
    fullLength: signature.length,
    hasPrefix: signature.startsWith('0x'),
    type: typeof signature,
  })

  let normalized = signature.trim()

  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    console.log('⚠️  Missing 0x prefix, adding it')
    normalized = `0x${normalized}`
  }

  // Validate it's a hex string
  if (!isHex(normalized)) {
    throw new Error(
      `Signature is not a valid hex string: ${normalized.substring(0, 20)}...`
    )
  }

  // Check byte size and log signature type
  const sigBytes = hexToBytes(normalized as Hex)
  const byteSize = size(sigBytes)

  const signatureType =
    byteSize === 65 ? 'EOA (ECDSA)' : 'Smart Contract Wallet (EIP-1271)'

  console.log('🔍 Signature analysis:', {
    normalizedLength: normalized.length,
    byteSize,
    signatureType,
    isStandardEOA: byteSize === 65,
  })

  return normalized as Hex
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req
  switch (method) {
    case 'POST':
      try {
        const { message, signature, safeAddress, safeChainId } = req.body
        const siweMessage = parseSiweMessage(message) as SiweMessage
        const eoaAddress = siweMessage.address

        console.log('🔐 Starting signature verification for address:', eoaAddress)

        // Normalize signature to handle wallet-specific formats
        const normalizedSignature = normalizeSignature(signature)

        // Get the provider for this chain (cached PublicClient)
        const chainId = siweMessage.chainId as CHAIN_ID
        console.log('🌐 Getting provider for chain ID:', chainId)

        const provider = getProvider(chainId)

        // Verify signature (automatically handles both EOA and smart contract wallets)
        // - EOA wallets: Uses ECDSA recovery (65-byte signatures)
        // - Smart contract wallets: Uses EIP-1271 isValidSignature (variable length)
        const valid = await provider.verifyMessage({
          address: eoaAddress,
          message,
          signature: normalizedSignature,
        })

        if (!valid) {
          console.error('❌ Signature verification failed')
          throw new Error('Invalid signature.')
        }

        console.log('✅ Signature verified successfully')

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
          delete session.eoaAddress
          delete session.safeAddress
          delete session.safeChainId
          session.siwe = siweMessage
        }

        delete session.nonce
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
})(handler)
