import { CACHE_TIMES } from '@buildeross/constants/cacheTimes'
import { PUBLIC_DEFAULT_CHAINS } from '@buildeross/constants/chains'
import type { CandidateGroup } from '@buildeross/sdk'
import { getCandidateGroup } from '@buildeross/sdk'
import { getDAOAddresses } from '@buildeross/sdk/contract'
import { useChainStore } from '@buildeross/stores'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React from 'react'
import { getDaoLayout } from 'src/layouts/DaoLayout'
import { NextPageWithLayout } from 'src/pages/_app'
import useSWR from 'swr'

interface CandidateDetailPageProps {
  candidateId: string
  initialData?: CandidateGroup
  chainId?: number
  addresses?: any
}

const CandidateDetailPage: NextPageWithLayout<CandidateDetailPageProps> = ({
  candidateId,
  initialData,
}) => {
  const router = useRouter()
  const { chain } = useChainStore()

  const { data: candidate, error } = useSWR(
    candidateId ? ['candidate', chain.id, candidateId] : null,
    () => getCandidateGroup(chain.id, candidateId),
    {
      fallbackData: initialData,
      revalidateOnMount: true,
    }
  )

  if (error) {
    return (
      <Box py="x8">
        <Text color="negative" textAlign="center">
          Error loading candidate
        </Text>
      </Box>
    )
  }

  if (!candidate) {
    return (
      <Box py="x8">
        <Text color="text3" textAlign="center">
          Loading candidate...
        </Text>
      </Box>
    )
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="x6">
        <Text variant="heading-sm" style={{ fontWeight: 800 }}>
          Candidate Details
        </Text>
        <Button onClick={() => router.back()}>Back</Button>
      </Flex>

      <Stack gap="x6">
        {/* Candidate ID */}
        <Box>
          <Text fontWeight="label" mb="x2">
            Candidate ID
          </Text>
          <Text fontFamily="mono" fontSize={14}>
            {candidate.id}
          </Text>
        </Box>

        {/* Proposer */}
        <Box>
          <Text fontWeight="label" mb="x2">
            Proposer
          </Text>
          <Text fontFamily="mono" fontSize={14}>
            {candidate.proposer}
          </Text>
        </Box>

        {/* Stats */}
        <Flex gap="x6">
          <Box>
            <Text fontWeight="label" mb="x2">
              Versions
            </Text>
            <Text fontSize={24}>{candidate.versionCount.toString()}</Text>
          </Box>
          <Box>
            <Text fontWeight="label" mb="x2">
              Comments
            </Text>
            <Text fontSize={24}>{candidate.commentCount.toString()}</Text>
          </Box>
        </Flex>

        {/* Sentiment */}
        <Box>
          <Text fontWeight="label" mb="x2">
            Sentiment
          </Text>
          <Flex gap="x4">
            <Text color="positive">For: {candidate.currentForCount.toString()}</Text>
            <Text color="negative">
              Against: {candidate.currentAgainstCount.toString()}
            </Text>
            <Text color="text3">Abstain: {candidate.currentAbstainCount.toString()}</Text>
          </Flex>
        </Box>

        {/* Leading Version */}
        {candidate.leadingVersion && (
          <Box>
            <Text fontWeight="label" mb="x4">
              Leading Version
            </Text>
            <Stack gap="x4" p="x4" borderRadius="curved" backgroundColor="background2">
              <Box>
                <Text fontWeight="label" fontSize={14} mb="x1">
                  Title
                </Text>
                <Text>{candidate.leadingVersion.title}</Text>
              </Box>
              <Box>
                <Text fontWeight="label" fontSize={14} mb="x1">
                  Description
                </Text>
                <Text>{candidate.leadingVersion.description}</Text>
              </Box>
              {candidate.leadingVersion.discussionUrl && (
                <Box>
                  <Text fontWeight="label" fontSize={14} mb="x1">
                    Discussion
                  </Text>
                  <Text
                    as="a"
                    href={candidate.leadingVersion.discussionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'underline' }}
                  >
                    {candidate.leadingVersion.discussionUrl}
                  </Text>
                </Box>
              )}
              <Flex gap="x4">
                <Text fontSize={14} color="text3">
                  Version: {candidate.leadingVersion.versionNumber.toString()}
                </Text>
                <Text fontSize={14} color="text3">
                  Signatures: {candidate.leadingVersion.signatureCount.toString()}
                </Text>
              </Flex>
            </Stack>
          </Box>
        )}

        {/* All Versions */}
        {candidate.versions && candidate.versions.length > 0 && (
          <Box>
            <Text fontWeight="label" mb="x4">
              All Versions ({candidate.versions.length})
            </Text>
            <Stack gap="x3">
              {candidate.versions.map((version) => (
                <Box
                  key={version.id}
                  p="x3"
                  borderRadius="curved"
                  backgroundColor="background1"
                >
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="label">
                      Version {version.versionNumber.toString()}
                    </Text>
                    <Text fontSize={14} color="text3">
                      {version.signatureCount.toString()} signatures
                    </Text>
                  </Flex>
                  <Text fontSize={14} color="text3" mt="x1">
                    {version.title}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

CandidateDetailPage.getLayout = getDaoLayout

export const getServerSideProps: GetServerSideProps = async (context) => {
  const network = context.params?.network as string
  const token = context.params?.token as AddressType
  const candidateId = context.params?.candidateId as string

  // Validate network
  const validChain = PUBLIC_DEFAULT_CHAINS.find(
    (chain) => chain.slug === network || String(chain.id) === network
  )

  if (!validChain) {
    return { notFound: true }
  }

  const addresses = await getDAOAddresses(validChain.id, token)

  if (!addresses) {
    return { notFound: true }
  }

  // Fetch candidate data server-side
  let initialData: CandidateGroup | undefined
  try {
    initialData = await getCandidateGroup(validChain.id as CHAIN_ID, candidateId)
    if (!initialData) {
      return { notFound: true }
    }
  } catch (error) {
    console.error('Error fetching candidate:', error)
    // Continue without initial data, let client fetch
  }

  // Set cache headers
  context.res.setHeader(
    'Cache-Control',
    `public, s-maxage=${CACHE_TIMES.DAO_FEED}, stale-while-revalidate`
  )

  return {
    props: {
      addresses,
      candidateId,
      initialData: initialData || null,
      chainId: validChain.id,
    },
  }
}

export default CandidateDetailPage
