import { CandidateList } from '@buildeross/candidate-ui'
import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import type { CandidateGroupsResponse } from '@buildeross/sdk'
import { getCandidateGroups } from '@buildeross/sdk'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import useSWR from 'swr'

interface CandidatesPageProps {
  initialData?: CandidateGroupsResponse
  chainId?: number
  addresses?: any
}

const CandidatesPage: NextPageWithLayout<CandidatesPageProps> = ({ initialData }) => {
  const router = useRouter()
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()

  const { data, error, isLoading } = useSWR(
    addresses.token ? ['candidates', chain.id, addresses.token] : null,
    () => getCandidateGroups(chain.id, addresses.token!),
    {
      fallbackData: initialData,
      revalidateOnMount: true,
    }
  )

  const handleSelectCandidate = (candidateId: string) => {
    router.push({
      pathname: '/dao/[network]/[token]/candidate/[candidateId]',
      query: {
        network: chain.slug,
        token: addresses.token,
        candidateId,
      },
    })
  }

  const handleCreateCandidate = () => {
    router.push({
      pathname: '/dao/[network]/[token]/candidate/create',
      query: {
        network: chain.slug,
        token: addresses.token,
      },
    })
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="x6">
        <Text variant="heading-sm" style={{ fontWeight: 800 }}>
          Proposal Candidates
        </Text>
        <Button onClick={handleCreateCandidate}>Create Candidate</Button>
      </Flex>

      {error && (
        <Text color="negative" textAlign="center" py="x8">
          Error loading candidates
        </Text>
      )}

      {isLoading && !data && (
        <Text color="text3" textAlign="center" py="x8">
          Loading candidates...
        </Text>
      )}

      {data && (
        <Stack gap="x4">
          <Text color="text3" fontSize={14}>
            {data.candidateGroups.length} candidate
            {data.candidateGroups.length !== 1 ? 's' : ''} found
          </Text>
          <CandidateList
            candidates={data.candidateGroups}
            onSelectCandidate={handleSelectCandidate}
          />
        </Stack>
      )}
    </Box>
  )
}

CandidatesPage.getLayout = getDaoLayout

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network = context.params?.network as string
  const token = context.params?.token as string

  // Validate network
  const validChain = PUBLIC_DEFAULT_CHAINS.find(
    (chain) => chain.slug === network || String(chain.id) === network
  )

  if (!validChain) {
    return { notFound: true }
  }

  // Fetch candidates server-side
  let initialData: CandidateGroupsResponse | undefined
  try {
    initialData = await getCandidateGroups(validChain.id as CHAIN_ID, token.toLowerCase())
  } catch (error) {
    console.error('Error fetching candidates:', error)
    // Continue without initial data, let client fetch
  }

  // Set cache headers
  context.res.setHeader(
    'Cache-Control',
    `public, s-maxage=${CACHE_TIMES.DAO_FEED}, stale-while-revalidate`
  )

  return {
    props: {
      initialData: initialData || null,
    },
  }
}

export default CandidatesPage
