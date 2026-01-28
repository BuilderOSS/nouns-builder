import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { governorAbi } from '@buildeross/sdk/contract'
import { getProposal } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { Box, ButtonProps } from '@buildeross/zord'
import React, { useCallback, useState } from 'react'
import { useSWRConfig } from 'swr'
import { ContractFunctionName } from 'viem'
import {
  useConfig,
  useSimulateContract,
  UseSimulateContractParameters,
  useWriteContract,
} from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'

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

  const { data, isError } = useSimulateContract({
    query: {
      enabled: !!addresses.governor,
    },
    address: addresses.governor,
    abi: governorAbi,
    functionName: functionName,
    args: args,
  })

  const { writeContractAsync } = useWriteContract()

  const handleClick = useCallback(async () => {
    if (!writeContractAsync || !data) return

    try {
      setIsPending(true)
      const hash = await writeContractAsync(data.request as any)
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
  }, [writeContractAsync, data, config, chain.id, mutate, proposalId, onSuccess])

  return (
    <ContractButton
      chainId={chain.id}
      handleClick={handleClick}
      className={buttonClassName}
      disabled={isPending || isError}
      {...rest}
    >
      {isPending ? <Box className={uploadingSpinnerWhite} /> : buttonText}
    </ContractButton>
  )
}
