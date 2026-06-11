import { PUBLIC_MANAGER_ADDRESS } from '@buildeross/constants/addresses'
import { RENDERER_BASE } from '@buildeross/constants/rendererBase'
import { managerAbi } from '@buildeross/sdk/contract'
import { CHAIN_ID } from '@buildeross/types'
import { useState } from 'react'
import { encodeAbiParameters, parseAbiParameters, zeroAddress } from 'viem'
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { DAOConfigParams, DeployedContracts } from './useCrossChainMigration'

export const useDeployDAO = (config?: DAOConfigParams, targetChainId?: CHAIN_ID) => {
  const [deployedAddresses, setDeployedAddresses] = useState<DeployedContracts>()

  const { writeContractAsync, data: txHash, isPending } = useWriteContract()
  const publicClient = usePublicClient({ chainId: targetChainId })

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const deploy = async () => {
    if (!config || !targetChainId) {
      throw new Error('Missing configuration or target chain')
    }

    const managerAddress = PUBLIC_MANAGER_ADDRESS[targetChainId]
    if (!managerAddress || managerAddress === zeroAddress) {
      throw new Error(`No Manager contract on chain ${targetChainId}`)
    }

    // Prepare founder params
    const founderParams = config.founders.map((f) => ({
      wallet: f.wallet,
      ownershipPct: BigInt(f.ownershipPct),
      vestExpiry: f.vestExpiry,
    }))

    // Encode token init strings
    const tokenInitStrings = encodeAbiParameters(
      parseAbiParameters(
        'string name, string symbol, string description, string daoImage, string daoWebsite, string baseRenderer'
      ),
      [
        config.name,
        config.symbol,
        config.description,
        config.daoImage,
        config.projectURI,
        RENDERER_BASE,
      ]
    )

    // Prepare token params
    const tokenParams = {
      initStrings: tokenInitStrings as any,
      reservedUntilTokenId: config.reservedUntilTokenId,
      metadataRenderer: config.metadataRenderer,
    }

    // Prepare auction params
    const auctionParams = {
      reservePrice: config.reservePrice,
      duration: BigInt(config.duration),
      founderRewardRecipient: zeroAddress,
      founderRewardBps: 0,
    }

    // Prepare governance params
    const govParams = {
      timelockDelay: config.timelockDelay,
      votingDelay: config.votingDelay,
      votingPeriod: config.votingPeriod,
      proposalThresholdBps: config.proposalThresholdBps,
      quorumThresholdBps: config.quorumThresholdBps,
      vetoer: config.vetoer,
    }

    // Execute deployment
    const hash = await writeContractAsync({
      abi: managerAbi,
      address: managerAddress,
      functionName: 'deploy',
      args: [founderParams, tokenParams, auctionParams, govParams],
      chainId: targetChainId,
    })

    return hash
  }

  const fetchDeployedAddresses = async (tokenAddress: string) => {
    if (!targetChainId || !publicClient) return

    const addresses = await publicClient.readContract({
      abi: managerAbi,
      address: PUBLIC_MANAGER_ADDRESS[targetChainId],
      functionName: 'getAddresses',
      args: [tokenAddress as any],
    })

    if (addresses && Array.isArray(addresses)) {
      const [metadata, auction, treasury, governor] = addresses as any[]
      const deployed = {
        token: tokenAddress as any,
        metadata,
        auction,
        treasury,
        governor,
      }
      setDeployedAddresses(deployed)
      return deployed
    }
  }

  return {
    deploy,
    fetchDeployedAddresses,
    deployedAddresses,
    txHash,
    isDeploying: isPending,
    isConfirming,
    isSuccess,
  }
}
