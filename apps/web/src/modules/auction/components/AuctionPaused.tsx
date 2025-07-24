import SWR_KEYS from '@buildeross/constants/swrKeys'
import { auctionAbi } from '@buildeross/sdk/contract'
import { ProposalState } from '@buildeross/sdk/contract'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { atoms, Box, Stack } from '@buildeross/zord'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Icon } from 'src/components/Icon'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

export const AuctionPaused = () => {
  const { query, isReady } = useRouter()
  const chain = useChainStore((x) => x.chain)
  const LIMIT = 20

  const { auction } = useDaoStore((x) => x.addresses)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: auction,
    functionName: 'paused',
    chainId: chain.id,
  })

  const { data } = useSWR<ProposalsResponse>(
    paused && isReady ? [SWR_KEYS.PROPOSALS, chain.id, query.token, query.page] : null,
    ([_key, chainId, token, page]) =>
      getProposals(chainId as CHAIN_ID, token as string, LIMIT, Number(page))
  )

  const pausedProposal = useMemo(() => {
    if (!(paused && auction)) return undefined

    const pauseCalldata = encodeFunctionData({
      abi: auctionAbi,
      functionName: 'pause',
    })

    const unpauseCalldata = encodeFunctionData({
      abi: auctionAbi,
      functionName: 'unpause',
    })

    return data?.proposals.find((proposal) => {
      if (proposal.state !== ProposalState.Executed) return false

      const pauseIndex = proposal.calldatas.findIndex(
        (calldata) => calldata === pauseCalldata
      )
      const unpauseIndex = proposal.calldatas.findIndex(
        (calldata) => calldata === unpauseCalldata
      )

      const isPausing = pauseIndex >= 0 ? proposal.targets[pauseIndex] !== auction : false
      const isUnpausing =
        unpauseIndex >= 0 ? proposal.targets[unpauseIndex] === auction : false

      if (isPausing && !isUnpausing) return proposal
    })
  }, [paused, data?.proposals, auction])

  if (!paused) return null

  return (
    <Stack align={'center'} w="100%" mt="x7">
      <Box color="text3" fontSize={18}>
        Auctions have been paused.
      </Box>
      <Link
        shallow={!pausedProposal?.proposalId}
        href={
          pausedProposal?.proposalId
            ? `/dao/${query.network}/${query.token}/vote/${pausedProposal?.proposalNumber}`
            : `/dao/${query.network}/${query.token}?tab=activity`
        }
      >
        <Box
          display={'inline-flex'}
          color="text3"
          mt="x1"
          fontSize={18}
          className={atoms({ textDecoration: 'underline' })}
        >
          {pausedProposal?.proposalId ? 'See proposal here' : 'See activity tab'}
          {pausedProposal?.proposalId ? (
            <Icon align="center" fill="text4" id="external-16" size="sm" />
          ) : (
            <></>
          )}
        </Box>
      </Link>
    </Stack>
  )
}
