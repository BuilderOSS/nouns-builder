import { getDAOMembership } from '@buildeross/sdk'
import { type AddressType, CHAIN_ID } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Address, isAddress } from 'viem'

import { type AuthContext, withAuth } from './authMiddleware'

const VALID_CHAIN_IDS = new Set<CHAIN_ID>(
  Object.values(CHAIN_ID).filter((value): value is CHAIN_ID => typeof value === 'number')
)

export interface DaoMembershipData {
  authContext: AuthContext // Full auth context (EOA, Safe info, etc.)
  effectiveAddress: Address // Address that has DAO membership (Safe or EOA)
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
 * 5. In Safe mode: Safe chain must match DAO chain
 * 6. Checks membership for both EOA and Safe (if in Safe mode)
 *
 * Usage:
 * ```typescript
 * export default withDaoAuth(async (req, res, membership) => {
 *   // User is authenticated AND is a DAO member
 *   // membership.isMember is guaranteed to be true
 *   // membership.effectiveAddress is the address with DAO membership
 *   // membership.authContext contains full auth info (EOA, Safe, etc.)
 *   res.json({ member: membership.effectiveAddress })
 * })
 * ```
 */
export function withDaoAuth(
  handler: DaoAuthenticatedHandler,
  options?: { allowNonMembers?: boolean }
) {
  return withAuth(
    async (req: NextApiRequest, res: NextApiResponse, authContext: AuthContext) => {
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

        // In Safe mode, validate that Safe chain matches DAO chain
        if (authContext.isSafeMode && authContext.safeChainId !== chainId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: `Safe is on chain ${authContext.safeChainId} but DAO is on chain ${chainId}. Cannot access DAO from different chain.`,
          })
        }

        // Check membership for both EOA and Safe (if in Safe mode)
        // Authorize if either has membership
        let effectiveMembership: {
          address: Address
          hasBalance: boolean
          hasVotes: boolean
          isMember: boolean
        } | null = null

        // First check effective address (Safe if Safe mode, else EOA)
        const effectiveData = await getDAOMembership(
          chainId,
          tokenAddress as AddressType,
          authContext.effectiveAddress as AddressType
        )

        if (!effectiveData) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'DAO not found for the specified token address',
          })
        }

        const { daoAddresses } = effectiveData

        // Validate treasury address matches the DAO
        if (daoAddresses.treasury.toLowerCase() !== treasuryAddress.toLowerCase()) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Treasury address does not match the specified DAO token',
          })
        }

        // Check effective address first
        if (effectiveData.isMember) {
          effectiveMembership = {
            address: authContext.effectiveAddress,
            hasBalance: effectiveData.hasBalance,
            hasVotes: effectiveData.hasVotes,
            isMember: true,
          }
        }

        // If not a member via effective address and in Safe mode, check EOA
        if (!effectiveMembership && authContext.isSafeMode) {
          const eoaData = await getDAOMembership(
            chainId,
            tokenAddress as AddressType,
            authContext.eoaAddress as AddressType
          )

          if (eoaData?.isMember) {
            effectiveMembership = {
              address: authContext.eoaAddress,
              hasBalance: eoaData.hasBalance,
              hasVotes: eoaData.hasVotes,
              isMember: true,
            }
          }
        }

        // Build membership data
        const membership: DaoMembershipData = {
          authContext,
          effectiveAddress: effectiveMembership?.address || authContext.effectiveAddress,
          tokenAddress: daoAddresses.token as Address,
          treasuryAddress: daoAddresses.treasury as Address,
          chainId,
          isMember: !!effectiveMembership,
          hasBalance: effectiveMembership?.hasBalance || false,
          hasVotes: effectiveMembership?.hasVotes || false,
        }

        // Check membership unless explicitly allowed to bypass
        if (!membership.isMember && !options?.allowNonMembers) {
          return res.status(403).json({
            error: 'Forbidden',
            message:
              'You must be a member of this DAO to access this resource. Hold at least one governance token or have delegated voting power.',
          })
        }

        return handler(req, res, membership)
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
