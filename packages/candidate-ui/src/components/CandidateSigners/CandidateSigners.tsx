import { useEnsData, useVotes } from '@buildeross/hooks'
import type { CandidateSponsorSignature } from '@buildeross/sdk/subgraph'
import { getCandidateSponsorSignatures } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { WalletIdentityWithPreview } from '@buildeross/ui'
import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'

import { CandidateSignatureButton } from '../CandidateSignatureButton'

type CandidateSignersProps = {
  candidateVersionUID: string
  proposer: `0x${string}`
  governorAddress: `0x${string}`
  tokenSymbol: string
  proposalId: `0x${string}`
  signatureCount?: number
}

export const CandidateSigners: React.FC<CandidateSignersProps> = ({
  candidateVersionUID,
  proposer,
  governorAddress,
  tokenSymbol,
  proposalId,
  signatureCount = 0,
}) => {
  const { chain } = useChainStore()
  const { addresses } = useDaoStore()
  const { address } = useAccount()
  const [expanded, setExpanded] = React.useState(false)

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

  const signatures = signaturesData?.signatures || []
  const visibleSignatures = expanded ? signatures : signatures.slice(0, 5)
  const remainingCount = Math.max(signatures.length - 5, 0)

  const { votes } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress,
    signerAddress: address,
    enabled: !!address && !!addresses.token,
  })

  const totalSignatures = signatures.length > 0 ? signatures.length : signatureCount

  const alreadySigned = React.useMemo(() => {
    if (!address) return false
    return signatures.some(
      (signature) => signature.signer.toLowerCase() === address.toLowerCase()
    )
  }, [address, signatures])

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
          <Flex align="center" gap="x2">
            <Icon id="handshake" size="sm" color="text3" />
            <Heading size="xs">Candidate Sponsors</Heading>
          </Flex>
          <Text size="sm" color="text3">
            {totalSignatures} {totalSignatures === 1 ? 'signature' : 'signatures'}
          </Text>
        </Flex>

        <CandidateSignatureButton
          candidateVersionUID={candidateVersionUID as `0x${string}`}
          proposer={proposer}
          governorAddress={governorAddress}
          tokenSymbol={tokenSymbol}
          proposalId={proposalId as `0x${string}`}
          alreadySigned={alreadySigned}
          voteWeight={votes}
          signatureCount={totalSignatures}
          onSuccess={() => void mutate()}
        />

        {signatures.length > 0 ? (
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

            {expanded && signatures.length > 5 && (
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
