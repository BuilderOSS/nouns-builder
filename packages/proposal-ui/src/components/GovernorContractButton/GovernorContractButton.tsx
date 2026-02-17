import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { governorAbi } from '@buildeross/sdk/contract'
import { getProposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Box, ButtonProps } from '@buildeross/zord'
import { useCallback, useState } from 'react'
import { useSWRConfig } from 'swr'
import { ContractFunctionName, encodeFunctionData } from 'viem'
import { useConfig, UseSimulateContractParameters } from 'wagmi'
import {
  estimateGas,
  simulateContract,
  waitForTransactionReceipt,
  writeContract,
} from 'wagmi/actions'

import { uploadingSpinnerWhite } from './GovernorContractButton.css'

type GovernorContractButtonProps = Pick<
  UseSimulateContractParameters<
    typeof governorAbi,
    ContractFunctionName<typeof governorAbi, 'nonpayable' | 'payable'>
  >,
  'functionName' | 'args'
> & {
  proposalId: string
  buttonText: string
  buttonClassName?: string
  onSuccess: () => void
} & Omit<ButtonProps, 'type'>

export function GovernorContractButton({
  functionName,
  args,
  proposalId,
  buttonText,
  buttonClassName,
  onSuccess,
  ...rest
}: GovernorContractButtonProps) {
  const { addresses } = useDaoStore()
  const { mutate } = useSWRConfig()
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()

  const [isPending, setIsPending] = useState<boolean>(false)

  const handleClick = useCallback(async () => {
    if (!addresses.governor || !functionName || !args) return

    try {
      setIsPending(true)
      await simulateContract(config, {
        address: addresses.governor,
        abi: governorAbi,
        functionName: functionName,
        args: args,
        chainId: chain.id,
      })

      const encodedData = encodeFunctionData({
        abi: governorAbi,
        functionName: functionName,
        args: args,
      })
      const gas = await estimateGas(config, {
        to: addresses.governor,
        data: encodedData,
        chainId: chain.id,
      })

      const hash = await writeContract(config, {
        address: addresses.governor,
        abi: governorAbi,
        functionName: functionName,
        args: args,
        chainId: chain.id,
        gas: (gas * 3n) / 2n, // add extra gas for safety
      })
      await waitForTransactionReceipt(config, { hash, chainId: chain.id })

      await mutate(
        [SWR_KEYS.PROPOSAL, chain.id, proposalId],
        getProposal(chain.id, proposalId)
      )
      setIsPending(false)
      onSuccess()
    } catch (err) {
      setIsPending(false)
      console.error('Error interacting with governor contract:', err)
    }
  }, [
    config,
    chain.id,
    mutate,
    proposalId,
    onSuccess,
    addresses.governor,
    args,
    functionName,
  ])

  return (
    <ContractButton
      chainId={chain.id}
      handleClick={handleClick}
      className={buttonClassName}
      disabled={isPending}
      {...rest}
    >
      {isPending ? <Box className={uploadingSpinnerWhite} /> : buttonText}
    </ContractButton>
  )
}
