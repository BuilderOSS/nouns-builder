// @vitest-environment node
// jose's JWT signing for Alchemy rejects jsdom's Uint8Array
import { getAlchemyServerRpcUrl } from '@buildeross/constants/alchemy'
import { auctionAbi } from '@buildeross/sdk/contract'
import { CHAIN_ID } from '@buildeross/types'
import { alchemyServerFetch } from '@buildeross/utils/alchemyAuth'
import {
  Address,
  createPublicClient,
  encodeFunctionData,
  erc20Abi,
  http,
  parseEther,
  toHex,
} from 'viem'

import { simulate } from './simulationService'

// Runs against Alchemy Base Sepolia; requires server-side alchemy credentials
// (ALCHEMY_JWT_PRIVATE_KEY + ALCHEMY_JWT_KEY_ID, or ALCHEMY_API_KEY)
const hasServerCredentials =
  !!process.env.ALCHEMY_JWT_PRIVATE_KEY || !!process.env.ALCHEMY_API_KEY

describe.skipIf(!hasServerCredentials)('simulationService (Alchemy)', () => {
  const tokenAddress: Address = '0x1234567890123456789012345678901234567890'
  const treasuryAddress: Address = '0x1234000000000000000000000000000000005678'
  const recipient: Address = '0x1111111111111111111111111111111111111111'
  const weth: Address = '0x4200000000000000000000000000000000000006'
  const usdc: Address = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  // Lorem Ipsum DAO on Base Sepolia (auction owned by the treasury)
  const daoTreasury: Address = '0x9d3afcd3647a8a98b46550c7a0d88b7f3112e15c'
  const daoAuction: Address = '0xe789089a4ac67bbe4eb75cba6b237eb8c2b22d04'

  it('simulates successful and reverting calls', async () => {
    const result = await simulate({
      tokenAddress,
      treasuryAddress,
      chainId: CHAIN_ID.BASE_SEPOLIA,
      targets: [weth, usdc],
      calldatas: [
        encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [recipient, 1n],
        }),
        encodeFunctionData({
          abi: erc20Abi,
          functionName: 'transfer',
          args: [recipient, 1n],
        }),
      ],
      values: [toHex(0n), toHex(0n)],
    })

    expect(result.success).toBe(false)
    expect(result.simulations[0].status).toBe(true)
    expect(result.simulations[0].gas_used).toBeGreaterThan(21000)
    expect(result.simulations[1].status).toBe(false)
    expect(result.simulations[1].error).toMatch(/exceeds balance/i)
  }, 30_000)

  it('marks the call the treasury cannot fund', async () => {
    const result = await simulate({
      tokenAddress,
      treasuryAddress,
      chainId: CHAIN_ID.BASE_SEPOLIA,
      targets: [recipient, recipient],
      calldatas: ['0x', '0x'],
      values: ['0x0', toHex(parseEther('1'))],
    })

    expect(result.success).toBe(false)
    expect(result.simulations[0].status).toBe(true)
    expect(result.simulations[1]).toMatchObject({
      status: false,
      error: expect.stringMatching(/^Treasury doesn't have enough ETH for this call/),
    })
  }, 30_000)

  it('carries state between builder protocol calls made by the treasury', async () => {
    const client = createPublicClient({
      transport: http(getAlchemyServerRpcUrl(CHAIN_ID.BASE_SEPOLIA), {
        fetchFn: alchemyServerFetch,
      }),
    })
    const paused = await client.readContract({
      address: daoAuction,
      abi: auctionAbi,
      functionName: 'paused',
    })
    // the second call only succeeds if the first call's state change is applied
    const order = paused
      ? (['unpause', 'pause'] as const)
      : (['pause', 'unpause'] as const)

    const result = await simulate({
      tokenAddress,
      treasuryAddress: daoTreasury,
      chainId: CHAIN_ID.BASE_SEPOLIA,
      targets: [daoAuction, daoAuction],
      calldatas: order.map((functionName) =>
        encodeFunctionData({ abi: auctionAbi, functionName })
      ),
      values: [toHex(0n), toHex(0n)],
    })

    expect(result.success).toBe(true)
  }, 30_000)

  it('decodes builder protocol custom errors and empty reverts', async () => {
    const result = await simulate({
      tokenAddress,
      treasuryAddress,
      chainId: CHAIN_ID.BASE_SEPOLIA,
      targets: [daoAuction, weth],
      calldatas: [
        encodeFunctionData({ abi: auctionAbi, functionName: 'pause' }),
        // WETH withdraw without balance reverts without a reason
        '0x2e1a7d4d0000000000000000000000000000000000000000000000000de0b6b3a7640000',
      ],
      values: [toHex(0n), toHex(0n)],
    })

    expect(result.simulations[0].error).toBe('ONLY_OWNER()')
    expect(result.simulations[1].error).toBe('Execution reverted without a reason')
  }, 30_000)
})
