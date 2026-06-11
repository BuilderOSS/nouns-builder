import { PUBLIC_L1_BRIDGE_ADDRESS } from '@buildeross/constants/addresses'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { useMemo } from 'react'
import { encodeFunctionData, parseEther, zeroAddress } from 'viem'

/**
 * Hook to prepare a native ETH bridge transaction from source chain treasury to target chain treasury
 *
 * @param sourceChainId - Chain ID of the source DAO
 * @param targetTreasuryAddress - Treasury address on the target chain
 * @param amount - Amount of ETH to bridge (in ETH, e.g., "1.5")
 */
export const useBridgeTransaction = ({
  sourceChainId,
  targetTreasuryAddress,
  amount,
}: {
  sourceChainId: CHAIN_ID
  targetTreasuryAddress?: AddressType
  amount?: string
}) => {
  const bridgeTransaction = useMemo(() => {
    if (!targetTreasuryAddress || !amount || !sourceChainId) return undefined

    try {
      const bridgeAddress =
        PUBLIC_L1_BRIDGE_ADDRESS[sourceChainId as keyof typeof PUBLIC_L1_BRIDGE_ADDRESS]
      if (!bridgeAddress || bridgeAddress === zeroAddress) {
        console.error(`No bridge address found for chain ${sourceChainId}`)
        return undefined
      }

      const amountWei = parseEther(amount)

      // For native bridge on L2s (Optimism, Base, Zora), use bridgeETHTo
      // https://github.com/ethereum-optimism/optimism/blob/develop/packages/contracts-bedrock/src/L2/L2StandardBridge.sol
      const calldata = encodeFunctionData({
        abi: [
          {
            inputs: [
              { name: '_to', type: 'address' },
              { name: '_minGasLimit', type: 'uint32' },
              { name: '_extraData', type: 'bytes' },
            ],
            name: 'bridgeETHTo',
            outputs: [],
            stateMutability: 'payable',
            type: 'function',
          },
        ],
        functionName: 'bridgeETHTo',
        args: [
          targetTreasuryAddress,
          200000, // min gas limit
          '0x' as `0x${string}`, // extra data
        ],
      })

      return {
        target: bridgeAddress,
        value: amountWei.toString(),
        calldata,
        functionSignature: 'bridgeETHTo(address,uint32,bytes)',
      }
    } catch (error) {
      console.error('Error preparing bridge transaction:', error)
      return undefined
    }
  }, [sourceChainId, targetTreasuryAddress, amount])

  return { bridgeTransaction }
}
