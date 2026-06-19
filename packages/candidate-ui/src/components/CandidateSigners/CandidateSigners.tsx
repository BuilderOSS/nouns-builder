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

import { CandidatePromoteButton, type ProposerSignature } from '../CandidatePromoteButton'
import { CandidateSignatureButton } from '../CandidateSignatureButton'

type CandidateSignersProps = {
  candidateVersionUID: string
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  description: string
  targets: string[]
  values: bigint[]
  calldatas: `0x${string}`[]
  signatureCount?: number
}

export const CandidateSigners: React.FC<CandidateSignersProps> = ({
  candidateVersionUID,
  proposer,
  governorAddress,
  tokenSymbol,
  description,
  targets,
  values,
  calldatas,
  signatureCount = 0,
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
    candidateVersionUID
      ? ['candidateSponsorSignatures', chain.id, candidateVersionUID]
      : null,
    () => getCandidateSponsorSignatures(chain.id, candidateVersionUID),
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
    () =>
      signatures.filter(
        (signature) => signature.signer.toLowerCase() !== proposer.toLowerCase()
      ),
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

  const totalSignatures = signaturesData ? eligibleSignatures.length : signatureCount
  const totalSignatureWeight = eligibleSignatures.reduce(
    (sum, signature) => sum + signature.voteWeight,
    0n
  )
  const proposerSignatures = React.useMemo<ProposerSignature[]>(
    () =>
      eligibleSignatures.map((signature) => ({
        signer: signature.signer as `0x${string}`,
        nonce: signature.nonce,
        deadline: signature.deadline,
        sig: signature.signature,
      })),
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
            {totalSignatures} {totalSignatures === 1 ? 'signature' : 'signatures'}
          </Text>
        </Flex>

        <CandidateSignatureButton
          candidateVersionUID={candidateVersionUID as `0x${string}`}
          proposer={proposer}
          governorAddress={governorAddress}
          tokenSymbol={tokenSymbol}
          alreadySigned={alreadySigned}
          voteWeight={votes}
          signatureCount={totalSignatures}
          onSuccess={() => void mutate()}
        />

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

        {isCreator && proposalThreshold !== undefined && targets.length > 0 && (
          <Box pt="x2">
            <CandidatePromoteButton
              candidateVersionUID={candidateVersionUID as `0x${string}`}
              targets={targets}
              values={values}
              calldatas={calldatas}
              description={description}
              signatures={proposerSignatures}
              proposalThreshold={proposalThreshold}
              totalSignatureWeight={totalSignatureWeight}
            />
          </Box>
        )}

        {!isCreator && proposalThreshold !== undefined && targets.length > 0 && (
          <Text color="text3" fontSize={14}>
            Only the candidate creator can submit this as a proposal.
          </Text>
        )}
      </Stack>
    </Box>
  )
}

function SignerRow({ signature }: { signature: CandidateSponsorSignature }) {
  const { displayName, ensAvatar } = useEnsData(signature.signer as string)

  return (
    <Flex align="center" justify="space-between" gap="x3">
      <WalletIdentityWithPreview
        address={signature.signer as `0x${string}`}
        displayName={displayName}
        avatarSrc={ensAvatar}
      />
      <Text color="text3">{signature.voteWeight.toString()} votes</Text>
    </Flex>
  )
}
