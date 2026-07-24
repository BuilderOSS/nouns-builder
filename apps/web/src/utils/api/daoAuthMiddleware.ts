import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import { getDAOAddresses } from '@buildeross/sdk'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import type { NextApiRequest, NextApiResponse } from 'next'
import { type Address, createPublicClient, http } from 'viem'
import type { SiweMessage } from 'viem/siwe'

import { withAuth } from './authMiddleware'

// Helper to get chain from chain ID
const getChain = (chainId: CHAIN_ID) => {
  const chain = PUBLIC_DEFAULT_CHAINS.find((c) => c.id === chainId)
  if (!chain) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  return chain
}

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
        if (!tokenAddress || !treasuryAddress || !chainId) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Request must include tokenAddress, treasuryAddress, and chainId',
          })
        }

        // Get DAO addresses from Manager contract
        const daoAddresses = await getDAOAddresses(chainId, tokenAddress as AddressType)

        if (!daoAddresses) {
          return res.status(404).json({
            error: 'Not Found',
            message: 'DAO not found for the specified token address',
          })
        }

        // Validate treasury address matches the DAO
        if (daoAddresses.treasury.toLowerCase() !== treasuryAddress.toLowerCase()) {
          return res.status(400).json({
            error: 'Bad Request',
            message: 'Treasury address does not match the specified DAO token',
          })
        }

        // Create public client for the chain
        const chain = getChain(chainId)
        const publicClient = createPublicClient({
          chain,
          transport: http(),
        })

        const userAddress = session.address as Address

        // Check DAO membership via two methods:
        // 1. balanceOf - direct token ownership
        // 2. getVotes - voting power (includes delegated votes)

        const tokenAbi = [
          {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'balanceOf',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
          {
            inputs: [{ name: 'account', type: 'address' }],
            name: 'getVotes',
            outputs: [{ name: '', type: 'uint256' }],
            stateMutability: 'view',
            type: 'function',
          },
        ] as const

        // Call both methods in parallel
        const [balance, votes] = await Promise.all([
          publicClient.readContract({
            address: daoAddresses.token as Address,
            abi: tokenAbi,
            functionName: 'balanceOf',
            args: [userAddress],
          }),
          publicClient.readContract({
            address: daoAddresses.token as Address,
            abi: tokenAbi,
            functionName: 'getVotes',
            args: [userAddress],
          }),
        ])

        const hasBalance = balance > 0n
        const hasVotes = votes > 0n
        const isMember = hasBalance || hasVotes

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
