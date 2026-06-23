import { useVotes } from '@buildeross/hooks'
import { governorAbi } from '@buildeross/sdk/contract'
import { getCandidateSponsorSignatures } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'
import { type Hex } from 'viem'
import { useAccount, useReadContract } from 'wagmi'

import { CandidatePromoteButton, type ProposerSignature } from '../CandidatePromoteButton'
import * as styles from './CandidatePromoteCard.css'

export interface CandidatePromoteCardProps {
  candidateId: Hex
  proposalHash: Hex
  proposer: `0x${string}`
  targets: string[]
  values: bigint[]
  calldatas: Hex[]
  description: string
  governorAddress: `0x${string}`
  onPromoteSuccess?: (proposalId: Hex) => void
}

export const CandidatePromoteCard: React.FC<CandidatePromoteCardProps> = ({
  candidateId,
  proposalHash,
  proposer,
  targets,
  values,
  calldatas,
  description,
  governorAddress,
  onPromoteSuccess,
}) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAccount()

  const isCreator = React.useMemo(
    () => !!address && address.toLowerCase() === proposer.toLowerCase(),
    [address, proposer]
  )

  // Fetch sponsor signatures
  const { data: signaturesData, isLoading: isLoadingSignatures } = useSWR(
    candidateId && proposalHash
      ? ['candidateSponsorSignatures', chain.id, candidateId, proposalHash]
      : null,
    () => getCandidateSponsorSignatures(chain.id, candidateId, proposalHash),
    { revalidateOnFocus: false }
  )

  // Fetch proposal threshold
  const { data: proposalThreshold, isLoading: isLoadingThreshold } = useReadContract({
    abi: governorAbi,
    address: governorAddress,
    functionName: 'proposalThreshold',
    chainId: chain.id,
    query: { enabled: !!governorAddress },
  })

  // Get creator's voting power
  const { votes, isLoading: isLoadingVotes } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress,
    signerAddress: address,
    enabled: !!address && !!addresses.token,
  })

  // Calculate voting power
  const signatures = React.useMemo(
    () => signaturesData?.signatures || [],
    [signaturesData?.signatures]
  )

  const eligibleSignatures = React.useMemo(
    () =>
      signatures.filter(
        (signature) => signature.signer.toLowerCase() !== proposer.toLowerCase()
      ),
    [proposer, signatures]
  )

  const totalSignatureWeight = eligibleSignatures.reduce(
    (sum, signature) => sum + signature.voteWeight,
    0n
  )

  const totalPromoteWeight = React.useMemo(
    () => totalSignatureWeight + (isCreator ? votes : 0n),
    [isCreator, totalSignatureWeight, votes]
  )

  const proposerSignatures: ProposerSignature[] = React.useMemo(
    () =>
      eligibleSignatures.map((sig) => ({
        signer: sig.signer as `0x${string}`,
        nonce: sig.nonce,
        deadline: sig.deadline,
        sig: sig.signature as Hex,
      })),
    [eligibleSignatures]
  )

  // Calculate states
  const isLoading = isLoadingSignatures || isLoadingThreshold || isLoadingVotes
  const requiredVoteWeight = proposalThreshold !== undefined ? proposalThreshold + 1n : 0n
  const meetsThreshold =
    proposalThreshold !== undefined && totalPromoteWeight >= requiredVoteWeight
  const hasTransactions = targets.length > 0

  // Don't show if loading or no transactions
  if (isLoading || !hasTransactions) {
    return null
  }

  // Don't show if threshold data isn't available
  if (proposalThreshold === undefined) {
    return null
  }

  // Determine card state
  const getCardState = () => {
    if (!meetsThreshold) {
      return {
        status: 'gathering',
        heading: 'Needs More Support',
        icon: 'pencil' as const,
        showProgress: true,
      }
    }

    if (isCreator) {
      return {
        status: 'ready',
        heading: 'Ready to Submit',
        icon: 'check' as const,
        showProgress: false,
      }
    }

    return {
      status: 'creator-only',
      heading: 'Awaiting Creator',
      icon: 'handshake' as const,
      showProgress: false,
    }
  }

  const cardState = getCardState()

  const getDescription = () => {
    const signatureCount = eligibleSignatures.length
    const formattedCurrent = totalPromoteWeight.toString()
    const formattedRequired = requiredVoteWeight.toString()

    if (cardState.status === 'gathering') {
      return `Has ${signatureCount} signature${signatureCount !== 1 ? 's' : ''} totaling ${formattedCurrent} votes. Needs ${formattedRequired} votes to submit.`
    }

    if (cardState.status === 'creator-only') {
      return `Has enough support (${signatureCount} signature${signatureCount !== 1 ? 's' : ''}, ${formattedCurrent} votes). Only the creator can submit.`
    }

    return `Has enough support to submit as a proposal (${signatureCount} signature${signatureCount !== 1 ? 's' : ''}, ${formattedCurrent} votes).`
  }

  const getProgressPercentage = () => {
    if (proposalThreshold === undefined || totalPromoteWeight === 0n) return 0
    const percentage = (Number(totalPromoteWeight) / Number(requiredVoteWeight)) * 100
    return Math.min(percentage, 100)
  }

  return (
    <Box
      className={styles.promoteCard}
      data-status={cardState.status}
      p={{ '@initial': 'x4', '@768': 'x6' }}
    >
      <Stack gap="x3">
        {/* Header */}
        <Flex align="center" gap="x2">
          <Icon id={cardState.icon} size="md" />
          <Text fontSize={18} fontWeight="display">
            {cardState.heading}
          </Text>
        </Flex>

        {/* Description */}
        <Text color="text3" fontSize={14}>
          {getDescription()}
        </Text>

        {/* Progress Bar */}
        {cardState.showProgress && (
          <Box className={styles.progressContainer}>
            <Box
              className={styles.progressBar}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </Box>
        )}

        {/* Actions */}
        {cardState.status === 'ready' && (
          <CandidatePromoteButton
            candidateId={candidateId}
            proposalHash={proposalHash}
            targets={targets}
            values={values}
            calldatas={calldatas}
            description={description}
            signatures={proposerSignatures}
            proposalThreshold={proposalThreshold}
            totalVoteWeight={totalPromoteWeight}
            hideInfo={true}
            onSuccess={onPromoteSuccess}
          />
        )}
      </Stack>
    </Box>
  )
}
