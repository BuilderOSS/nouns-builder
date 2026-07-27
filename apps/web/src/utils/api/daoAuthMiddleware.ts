import { getDAOMembership } from '@buildeross/sdk'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Address, isAddress } from 'viem'
import type { SiweMessage } from 'viem/siwe'

import { withAuth } from './authMiddleware'

const VALID_CHAIN_IDS = new Set<CHAIN_ID>(
  Object.values(CHAIN_ID).filter((value): value is CHAIN_ID => typeof value === 'number')
)

export interface DaoMembershipData {
  userAddress: Address
  tokenAddress: Address
  treasuryAddress: Address
  chainId: CHAIN_ID
  isMember: boolean
  hasBalance: boolean
  hasVotes: boolean
}

export type DaoAuthenticatedHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  session: SiweMessage,
  membership: DaoMembershipData
) => Promise<any> | any

/**
 * Middleware to require both SIWE authentication AND DAO membership
 *
 * Validates:
 * 1. User is authenticated (via SIWE)
 * 2. Request includes tokenAddress and treasuryAddress
 * 3. Treasury address matches the DAO's actual treasury
 * 4. User is a member (owns tokens OR has voting power)
 *
 * Usage:
 * ```typescript
 * export default withDaoAuth(async (req, res, session, membership) => {
 *   // User is authenticated AND is a DAO member
 *   // membership.isMember is guaranteed to be true
 *   res.json({ member: membership.userAddress })
 * })
 * ```
 */
export function withDaoAuth(
  handler: DaoAuthenticatedHandler,
  options?: { allowNonMembers?: boolean }
) {
  return withAuth(
    async (req: NextApiRequest, res: NextApiResponse, session: SiweMessage) => {
      try {
        const { tokenAddress, treasuryAddress, chainId } = req.body as {
          tokenAddress?: string
          treasuryAddress?: string
          chainId?: CHAIN_ID
        }

        // Validate required parameters
        if (
          typeof tokenAddress !== 'string' ||
          typeof treasuryAddress !== 'string' ||
          typeof chainId !== 'number'
        ) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Request must include tokenAddress, treasuryAddress, and chainId',
          })
        }

        if (!VALID_CHAIN_IDS.has(chainId)) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Invalid chain ID',
          })
        }

        if (!isAddress(tokenAddress, { strict: false })) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'tokenAddress must be a valid Ethereum address',
          })
        }

        if (!isAddress(treasuryAddress, { strict: false })) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'treasuryAddress must be a valid Ethereum address',
          })
        }

        const userAddress = session.address as Address

        // Get DAO membership data via multicall (3 contract reads in 1 RPC call)
        const membershipData = await getDAOMembership(
          chainId,
          tokenAddress as AddressType,
          userAddress as AddressType
        )

        if (!membershipData) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'DAO not found for the specified token address',
          })
        }

        const { daoAddresses, hasBalance, hasVotes, isMember } = membershipData

        // Validate treasury address matches the DAO
        if (daoAddresses.treasury.toLowerCase() !== treasuryAddress.toLowerCase()) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Treasury address does not match the specified DAO token',
          })
        }

        const membership: DaoMembershipData = {
          userAddress,
          tokenAddress: daoAddresses.token as Address,
          treasuryAddress: daoAddresses.treasury as Address,
          chainId,
          isMember,
          hasBalance,
          hasVotes,
        }

        // Check membership unless explicitly allowed to bypass
        if (!isMember && !options?.allowNonMembers) {
          return res.status(403).json({
            error: 'Forbidden',
            message:
              'You must be a member of this DAO to access this resource. Hold at least one governance token or have delegated voting power.',
          })
        }

        return handler(req, res, session, membership)
      } catch (error) {
        console.error('Error in DAO auth middleware:', error)
        return res.status(500).json({
          error: 'Internal Server Error',
          message: 'An error occurred while checking DAO membership',
        })
      }
    }
  )
}
