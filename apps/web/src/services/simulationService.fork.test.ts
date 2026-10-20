import { CHAIN_ID } from '@buildeross/types'
import { Address, encodeFunctionData, erc20Abi, parseEther, toHex } from 'viem'

import { InsufficientFundsError } from './errors'
import { simulate } from './simulationService'

// Runs against Alchemy Base Sepolia; requires a server-side ALCHEMY_API_KEY
describe.skipIf(!process.env.ALCHEMY_API_KEY)('simulationService (Alchemy)', () => {
  const tokenAddress: Address = '0x1234567890123456789012345678901234567890'
  const treasuryAddress: Address = '0x1234000000000000000000000000000000005678'
  const recipient: Address = '0x1111111111111111111111111111111111111111'
  const weth: Address = '0x4200000000000000000000000000000000000006'
  const usdc: Address = '0x036CbD53842c5426634e7929541eC2318f3dCF7e'

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

  it('throws InsufficientFundsError when the treasury cannot cover the value', async () => {
    await expect(
      simulate({
        tokenAddress,
        treasuryAddress,
        chainId: CHAIN_ID.BASE_SEPOLIA,
        targets: [recipient],
        calldatas: ['0x'],
        values: [toHex(parseEther('1'))],
      })
    ).rejects.toThrow(InsufficientFundsError)
  }, 30_000)
})
