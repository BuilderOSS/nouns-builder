import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi, ProposalState } from '@buildeross/sdk/contract'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { CHAIN_ID } from '@buildeross/types'
import { atoms, Box, Icon, Stack } from '@buildeross/zord'
import Link from 'next/link'
import { useMemo } from 'react'
import { useChainStore, useDaoStore } from 'src/stores'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

const LIMIT = 20

export const AuctionPaused = () => {
  const chain = useChainStore((x) => x.chain)

  const addresses = useDaoStore((x) => x.addresses)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'paused',
    chainId: chain.id,
  })

  const { data } = useSWR<ProposalsResponse>(
    paused && addresses.token
      ? ([SWR_KEYS.PROPOSALS, chain.id, addresses.token] as const)
      : null,
    ([_key, _chainId, _token, _page]) =>
      getProposals(_chainId as CHAIN_ID, _token as string, LIMIT)
  )

  const pausedProposal = useMemo(() => {
    if (!(paused && addresses.auction)) return undefined

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

      const isPausing =
        pauseIndex >= 0 ? proposal.targets[pauseIndex] === addresses.auction : false
      const isUnpausing =
        unpauseIndex >= 0 ? proposal.targets[unpauseIndex] === addresses.auction : false

      if (isPausing && !isUnpausing) return proposal
    })
  }, [paused, data?.proposals, addresses.auction])

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
            ? `/dao/${chain.slug}/${addresses.token}/vote/${pausedProposal?.proposalNumber}`
            : `/dao/${chain.slug}/${addresses.token}?tab=activity`
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
          {pausedProposal?.proposalId && (
            <Icon align="center" fill="text4" id="external-16" size="sm" />
          )}
        </Box>
      </Link>
    </Stack>
  )
}
