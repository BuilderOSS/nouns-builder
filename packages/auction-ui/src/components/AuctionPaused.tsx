import { SWR_KEYS } from '@buildeross/constants/swrKeys'
import { auctionAbi, ProposalState } from '@buildeross/sdk/contract'
import { getProposals, ProposalsResponse } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { atoms, Box, Stack } from '@buildeross/zord'
import { useMemo } from 'react'
import useSWR from 'swr'
import { encodeFunctionData } from 'viem'
import { useReadContract } from 'wagmi'

const LIMIT = 20
const page = 1

export const AuctionPaused: React.FC = () => {
  const chain = useChainStore((x) => x.chain)
  const { getDaoLink, getProposalLink } = useLinks()

  const addresses = useDaoStore((x) => x.addresses)

  const { data: paused } = useReadContract({
    abi: auctionAbi,
    address: addresses.auction,
    functionName: 'paused',
    chainId: chain.id,
  })

  const { data, isLoading } = useSWR<ProposalsResponse>(
    addresses.token && chain.id
      ? ([SWR_KEYS.PROPOSALS, chain.id, addresses.token, page] as const)
      : null,
    ([, _chainId, _token, _page]: [string, CHAIN_ID, string, number]) =>
      getProposals(_chainId, _token, LIMIT, _page)
  )

  const pausedProposalNumber: number | undefined = useMemo(() => {
    if (!(paused && addresses.auction)) return undefined

    const pauseCalldata = encodeFunctionData({
      abi: auctionAbi,
      functionName: 'pause',
    })

    const unpauseCalldata = encodeFunctionData({
      abi: auctionAbi,
      functionName: 'unpause',
    })

    const proposal = data?.proposals.find((proposal) => {
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

    return proposal?.proposalNumber
  }, [paused, data?.proposals, addresses.auction])

  if (!paused) return null

  return (
    <Stack align={'center'} w="100%" mt="x7">
      <Box color="text3" fontSize={18}>
        Auctions have been paused.
      </Box>
      {addresses.token && !isLoading && (
        <Link
          link={
            pausedProposalNumber
              ? getProposalLink(chain.id, addresses.token, pausedProposalNumber)
              : getDaoLink(chain.id, addresses.token, 'activity')
          }
          display={'inline-flex'}
          color="text3"
          mt="x1"
          fontSize={18}
          className={atoms({ textDecoration: 'underline' })}
        >
          {pausedProposalNumber ? 'View proposal' : 'View activity'}
        </Link>
      )}
    </Stack>
  )
}
