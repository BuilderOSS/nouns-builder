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
const PAGE = 1

const PAUSE_CALLDATA = encodeFunctionData({
  abi: auctionAbi,
  functionName: 'pause',
})

const UNPAUSE_CALLDATA = encodeFunctionData({
  abi: auctionAbi,
  functionName: 'unpause',
})

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
      ? ([SWR_KEYS.PROPOSALS, chain.id, addresses.token, LIMIT, PAGE] as const)
      : null,
    ([, _chainId, _token, _limit, _page]: [string, CHAIN_ID, string, number, number]) =>
      getProposals(_chainId, _token, _limit, _page)
  )

  const pausedProposalNumber: number | undefined = useMemo(() => {
    if (!(paused && addresses.auction)) return undefined

    const proposal = data?.proposals.find((p) => {
      if (p.state !== ProposalState.Executed) return false

      const pauseIndex = p.calldatas.findIndex((calldata) => calldata === PAUSE_CALLDATA)
      const unpauseIndex = p.calldatas.findIndex(
        (calldata) => calldata === UNPAUSE_CALLDATA
      )

      const isPausing =
        pauseIndex >= 0
          ? p.targets[pauseIndex]?.toLowerCase() === addresses.auction?.toLowerCase()
          : false
      const isUnpausing =
        unpauseIndex >= 0
          ? p.targets[unpauseIndex]?.toLowerCase() === addresses.auction?.toLowerCase()
          : false

      return isPausing && !isUnpausing
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
