import { useProposalState } from '@buildeross/hooks'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType, BytesType } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Box, Button, Flex, Heading, Icon, Stack, Text } from '@buildeross/zord'

import * as styles from './ProposalReplacementBanner.css'

export interface ProposalReplacementBannerProps {
  proposalId: BytesType
  replacedByProposalId?: BytesType | null
}

export function ProposalReplacementBanner({
  proposalId,
  replacedByProposalId,
}: ProposalReplacementBannerProps) {
  const { getProposalLink } = useLinks()
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)

  // Check proposal state
  const { isReplaced, isLoading } = useProposalState({
    chainId: chain.id,
    governorAddress: addresses.governor as AddressType,
    proposalId,
  })

  // Don't show banner if not replaced or no replacement ID
  if (!isReplaced || !replacedByProposalId || isLoading) {
    return null
  }

  const replacementLink = getProposalLink(
    chain.id,
    addresses.token as AddressType,
    replacedByProposalId
  )

  return (
    <Box className={styles.banner}>
      <Flex align="center" gap="x4" wrap="wrap">
        <Flex align="center" gap="x3" flex={1}>
          <Icon id="refresh" size="md" color="warning" />
          <Stack gap="x1">
            <Heading size="xs">This proposal has been updated</Heading>
            <Text size="sm" color="text3">
              The proposer created a new version of this proposal.
            </Text>
          </Stack>
        </Flex>

        <Flex align="center" gap="x3">
          <Link link={replacementLink}>
            <Button variant="primary" size="sm">
              <Flex align="center" gap="x2">
                View Latest Version
                <Icon id="arrow-right" size="sm" />
              </Flex>
            </Button>
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}
