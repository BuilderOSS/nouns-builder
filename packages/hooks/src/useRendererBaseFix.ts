import { RENDERER_BASE, SWR_KEYS } from '@buildeross/constants'
import { getProposals, metadataAbi, Proposal, ProposalState } from '@buildeross/sdk'
import {
  AddressType,
  BuilderTransaction,
  CHAIN_ID,
  DaoContractAddresses,
  Transaction,
  TransactionType,
} from '@buildeross/types'
import isUndefined from 'lodash/isUndefined'
import pickBy from 'lodash/pickBy'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

interface RendererBaseFix {
  shouldFix: boolean
  transaction?: BuilderTransaction
  description?: string
  activeProposalId?: string
}

interface RendererBaseFixProps {
  chainId: CHAIN_ID
  addresses: DaoContractAddresses
}

const findActiveProposal = (
  proposals: Proposal[],
  tx: Transaction
): Proposal | undefined => {
  const activeProposals = proposals?.filter(
    (proposal) =>
      proposal.state === ProposalState.Active ||
      proposal.state === ProposalState.Pending ||
      proposal.state === ProposalState.Queued ||
      proposal.state === ProposalState.Succeeded
  )

  const propInProgress = activeProposals.find((proposal) =>
    proposal.calldatas.includes(tx.calldata)
  )

  return propInProgress
}

export const useRendererBaseFix = ({
  chainId,
  addresses,
}: RendererBaseFixProps): RendererBaseFix => {
  const { metadata } = addresses
  const {
    data: rendererBase,
    isLoading,
    isError,
  } = useReadContract({
    abi: metadataAbi,
    address: metadata,
    chainId: chainId,
    functionName: 'rendererBase',
  })

  const { data: proposals } = useSWR(
    !!addresses.token
      ? ([SWR_KEYS.PROPOSALS_CALLDATAS, chainId, addresses.token] as const)
      : null,
    ([, _chainId, _token]) => getProposals(_chainId, _token, 100)
  )

  const hasUndefinedAddresses = Object.keys(pickBy(addresses, isUndefined)).length > 0
  if (!rendererBase || isLoading || hasUndefinedAddresses || isError || !proposals) {
    return {
      shouldFix: false,
      transaction: undefined,
      description: undefined,
      activeProposalId: undefined,
    }
  }

  const needsFix = rendererBase !== RENDERER_BASE

  const updateRendererBase: Transaction = {
    target: metadata as AddressType,
    functionSignature: 'updateRendererBase(string)',
    calldata: encodeFunctionData({
      abi: metadataAbi,
      functionName: 'updateRendererBase',
      args: [RENDERER_BASE],
    }),
    value: '',
  }

  const fixRendererBaseTransaction: BuilderTransaction = {
    type: TransactionType.FIX_RENDERER_BASE,
    summary: 'Fix Metadata Renderer Base',
    transactions: [updateRendererBase],
  }

  const activeProposal = findActiveProposal(proposals?.proposals, updateRendererBase)

  const noActiveProposal = isUndefined(activeProposal)

  return {
    shouldFix: noActiveProposal && needsFix,
    description: `This updates the metadata renderer to restore NFT image visibility on external marketplaces.`,
    activeProposalId: activeProposal?.proposalId,
    transaction: fixRendererBaseTransaction,
  }
}
