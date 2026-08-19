import { useEnsData, useVotes } from '@buildeross/hooks'
import { governorAbi } from '@buildeross/sdk/contract'
import type { CandidateSponsorSignature } from '@buildeross/sdk/subgraph'
import { getCandidateSponsorSignatures } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'
import { useAccount, useReadContract } from 'wagmi'

import { filterValidSignatures, isSignatureExpired } from '../../utils/candidateProposal'
import { CandidatePromoteButton, type ProposerSignature } from '../CandidatePromoteButton'
import { CandidateSignatureButton } from '../CandidateSignatureButton'

type CandidateSignersProps = {
  candidateId: `0x${string}`
  proposalHash: `0x${string}`
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  description: string
  targets: string[]
  values: bigint[]
  calldatas: `0x${string}`[]
  hideActions?: boolean
}

export const CandidateSigners: React.FC<CandidateSignersProps> = ({
  candidateId,
  proposalHash,
  proposer,
  governorAddress,
  tokenSymbol,
  description,
  targets,
  values,
  calldatas,
  hideActions = false,
}) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAccount()
  const [expanded, setExpanded] = React.useState(false)
  const isCreator = React.useMemo(
    () => !!address && address.toLowerCase() === proposer.toLowerCase(),
    [address, proposer]
  )

  const {
    data: signaturesData,
    isLoading,
    mutate,
  } = useSWR(
    candidateId && proposalHash
      ? ['candidateSponsorSignatures', chain.id, candidateId, proposalHash]
      : null,
    () => getCandidateSponsorSignatures(chain.id, candidateId, proposalHash),
    { revalidateOnFocus: false }
  )

  const { data: proposalThreshold } = useReadContract({
    abi: governorAbi,
    address: governorAddress,
    functionName: 'proposalThreshold',
    chainId: chain.id,
    query: { enabled: !!governorAddress },
  })

  const signatures = React.useMemo(
    () => signaturesData?.signatures || [],
    [signaturesData?.signatures]
  )
  const eligibleSignatures = React.useMemo(
    () => filterValidSignatures(signatures, proposer),
    [proposer, signatures]
  )
  const visibleSignatures = expanded ? eligibleSignatures : eligibleSignatures.slice(0, 5)
  const remainingCount = Math.max(eligibleSignatures.length - 5, 0)

  const { votes } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress,
    signerAddress: address,
    enabled: !!address && !!addresses.token,
  })

  // Only show signature count when data is loaded
  // Use eligibleSignatures.length which excludes proposer
  const totalSignatures = signaturesData ? eligibleSignatures.length : 0
  const totalSignatureWeight = eligibleSignatures.reduce(
    (sum, signature) => sum + signature.voteWeight,
    0n
  )
  const totalPromoteWeight = React.useMemo(
    () => totalSignatureWeight + (isCreator ? votes : 0n),
    [isCreator, totalSignatureWeight, votes]
  )
  const proposerSignatures = React.useMemo<ProposerSignature[]>(
    () =>
      eligibleSignatures
        .map((signature) => ({
          signer: signature.signer as `0x${string}`,
          nonce: signature.nonce,
          deadline: signature.deadline,
          sig: signature.signature,
        }))
        .sort(compareProposerSignaturesBySigner),
    [eligibleSignatures]
  )

  const alreadySigned = React.useMemo(() => {
    if (!address) return false
    return eligibleSignatures.some(
      (signature) => signature.signer.toLowerCase() === address.toLowerCase()
    )
  }, [address, eligibleSignatures])

  if (isLoading && signatures.length === 0) {
    return (
      <Box>
        <Text color="text3">Loading signatures...</Text>
      </Box>
    )
  }

  return (
    <Box>
      <Stack gap="x4">
        <Flex align="center" justify="space-between" wrap gap="x3">
          <Text fontSize={{ '@initial': 18, '@768': 20 }} fontWeight="display">
            Candidate Sponsors
          </Text>
          <Text size="sm" color="text3">
            {!signaturesData
              ? 'Loading...'
              : `${totalSignatures} ${totalSignatures === 1 ? 'signature' : 'signatures'}`}
          </Text>
        </Flex>

        {!hideActions && (
          <CandidateSignatureButton
            candidateId={candidateId}
            proposalHash={proposalHash}
            proposer={proposer}
            governorAddress={governorAddress}
            tokenSymbol={tokenSymbol}
            alreadySigned={alreadySigned}
            voteWeight={votes}
            onSuccess={() => void mutate()}
          />
        )}

        {eligibleSignatures.length > 0 ? (
          <Stack gap="x3">
            {visibleSignatures.map((signature) => (
              <SignerRow key={signature.id} signature={signature} />
            ))}

            {!expanded && remainingCount > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
                <Flex align="center" gap="x2">
                  <Icon id="chevron-down" size="sm" />
                  Show {remainingCount} more
                </Flex>
              </Button>
            )}

            {expanded && eligibleSignatures.length > 5 && (
              <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
                <Flex align="center" gap="x2">
                  <Icon id="chevron-up" size="sm" />
                  Show less
                </Flex>
              </Button>
            )}
          </Stack>
        ) : (
          <Text color="text3">No signatures yet.</Text>
        )}

        {signatures.length !== eligibleSignatures.length && (
          <Text color="negative" fontSize={14}>
            Candidate creator signatures are excluded from proposal submission.
          </Text>
        )}

        {!hideActions &&
          isCreator &&
          proposalThreshold !== undefined &&
          targets.length > 0 && (
            <Box pt="x2">
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
              />
            </Box>
          )}

        {!hideActions &&
          !isCreator &&
          proposalThreshold !== undefined &&
          targets.length > 0 && (
            <Text color="text3" fontSize={14}>
              Only the candidate creator can submit this as a proposal.
            </Text>
          )}
      </Stack>
    </Box>
  )
}

export function compareProposerSignaturesBySigner(
  a: ProposerSignature,
  b: ProposerSignature
) {
  const signerA = a.signer.toLowerCase()
  const signerB = b.signer.toLowerCase()

  if (signerA < signerB) return -1
  if (signerA > signerB) return 1
  return 0
}

function SignerRow({ signature }: { signature: CandidateSponsorSignature }) {
  const { displayName, ensAvatar } = useEnsData(signature.signer as string)
  const expired = isSignatureExpired(signature.deadline)

  return (
    <Flex
      align="center"
      justify="space-between"
      gap="x3"
      style={{ opacity: expired ? 0.5 : 1 }}
    >
      <WalletIdentityWithPreview
        address={signature.signer as `0x${string}`}
        displayName={displayName}
        avatarSrc={ensAvatar}
      />
      <Flex align="center" gap="x2">
        <Text color="text3">{signature.voteWeight.toString()} votes</Text>
        {expired && (
          <Text color="negative" fontSize={12}>
            (Expired)
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
