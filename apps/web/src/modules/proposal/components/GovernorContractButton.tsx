import { Box, ButtonProps } from '@buildeross/zord'
import React, { useState } from 'react'
import { useSWRConfig } from 'swr'
import { ContractFunctionName } from 'viem'
import {
  UseSimulateContractParameters,
  useConfig,
  useSimulateContract,
  useWriteContract,
} from 'wagmi'
import { waitForTransactionReceipt } from 'wagmi/actions'

import { ContractButton } from 'src/components/ContractButton'
import SWR_KEYS from 'src/constants/swrKeys'
import { governorAbi } from 'src/data/contract/abis'
import { getProposal } from 'src/data/subgraph/requests/proposalQuery'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'

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
} & ButtonProps

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
      enabled: !!addresses?.governor,
    },
    address: addresses?.governor,
    abi: governorAbi,
    functionName: functionName,
    args: args,
  })

  const { writeContractAsync } = useWriteContract()

  const handleClick = async () => {
    if (!writeContractAsync || !data) return

    try {
      setIsPending(true)
      const hash = await writeContractAsync(data.request)
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
  }

  return (
    <ContractButton
      handleClick={handleClick}
      className={buttonClassName}
      disabled={isPending || isError}
      {...rest}
    >
      {isPending ? <Box className={uploadingSpinnerWhite} /> : buttonText}
    </ContractButton>
  )
}
