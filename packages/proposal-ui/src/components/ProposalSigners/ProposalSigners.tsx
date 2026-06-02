import { useEnsData } from '@buildeross/hooks'
import { governorAbi } from '@buildeross/sdk/contract'
import type { AddressType, BytesType, CHAIN_ID } from '@buildeross/types'
import { WalletIdentity } from '@buildeross/ui'
import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@buildeross/zord'
import { useState } from 'react'
import useSWR from 'swr'
import { useConfig } from 'wagmi'
import { readContract } from 'wagmi/actions'

import * as styles from './ProposalSigners.css'

export interface ProposalSignersProps {
  chainId: CHAIN_ID
  governorAddress: AddressType
  proposalId: BytesType
}

export function ProposalSigners({
  chainId,
  governorAddress,
  proposalId,
}: ProposalSignersProps) {
  const config = useConfig()
  const [expanded, setExpanded] = useState(false)

  // Fetch signers from contract
  const {
    data: signerAddresses,
    isLoading,
    error,
  } = useSWR(
    ['proposalSigners', chainId, governorAddress, proposalId],
    async () => {
      try {
        const result = await readContract(config, {
          abi: governorAbi,
          address: governorAddress,
          functionName: 'getProposalSigners',
          args: [proposalId],
          chainId,
        })
        return result as AddressType[]
      } catch (err) {
        console.error('Error fetching proposal signers:', err)
        return []
      }
    },
    { revalidateOnFocus: false }
  )

  // No signers - not a signed proposal
  if (!isLoading && (!signerAddresses || signerAddresses.length === 0)) {
    return null
  }

  const visibleSigners = expanded ? signerAddresses : signerAddresses?.slice(0, 5)
  const remainingCount = signerAddresses ? signerAddresses.length - 5 : 0

  if (isLoading) {
    return (
      <Box className={styles.container}>
        <Text size="sm" color="text3">
          Loading signers...
        </Text>
      </Box>
    )
  }

  if (error) {
    return (
      <Box className={styles.container}>
        <Text size="sm" color="negative">
          Failed to load signers
        </Text>
      </Box>
    )
  }

  return (
    <Box className={styles.container}>
      <Stack gap="x4">
        <Flex align="center" justify="space-between">
          <Flex align="center" gap="x2">
            <Icon id="handshake" size="sm" color="text3" />
            <Heading size="xs">Proposal Sponsors</Heading>
          </Flex>
          <Text size="sm" color="text3">
            {signerAddresses?.length}{' '}
            {signerAddresses?.length === 1 ? 'signer' : 'signers'}
          </Text>
        </Flex>

        <Stack gap="x3">
          {visibleSigners?.map((address) => (
            <SignerRow key={address} address={address} chainId={chainId} />
          ))}
        </Stack>

        {!expanded && remainingCount > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded(true)}>
            <Flex align="center" gap="x2">
              <Icon id="chevron-down" size="sm" />
              Show {remainingCount} more
            </Flex>
          </Button>
        )}

        {expanded && signerAddresses && signerAddresses.length > 5 && (
          <Button variant="ghost" size="sm" onClick={() => setExpanded(false)}>
            <Flex align="center" gap="x2">
              <Icon id="chevron-up" size="sm" />
              Show less
            </Flex>
          </Button>
        )}
      </Stack>
    </Box>
  )
}

interface SignerRowProps {
  address: AddressType
  chainId: CHAIN_ID
}

function SignerRow({ address }: SignerRowProps) {
  const { displayName, ensAvatar } = useEnsData(address)

  return (
    <Flex align="center" justify="space-between" className={styles.signerRow}>
      <WalletIdentity
        address={address}
        displayName={displayName}
        avatarSrc={ensAvatar}
        avatarSize="32"
        asLink
      />
    </Flex>
  )
}
