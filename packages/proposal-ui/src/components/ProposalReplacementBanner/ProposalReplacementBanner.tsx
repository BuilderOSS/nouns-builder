import { useProposalState } from '@buildeross/hooks'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import type { AddressType, BytesType } from '@buildeross/types'
import { useLinks } from '@buildeross/ui/LinksProvider'
import { LinkWrapper as Link } from '@buildeross/ui/LinkWrapper'
import { Button, Flex, Icon, Stack, Text } from '@buildeross/zord'

import * as styles from '../ProposalEditedBanner/ProposalEditedBanner.css'

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
    <Flex
      align="center"
      justify="space-between"
      gap="x4"
      p="x4"
      borderRadius="curved"
      borderWidth="thin"
      borderColor="warning"
      backgroundColor="background2"
      wrap
    >
      <Flex align="center" gap="x3" className={styles.contentWrapper}>
        <Icon id="refresh" size="md" color="warning" className={styles.iconWrapper} />
        <Stack gap="x1" className={styles.textWrapper}>
          <Text fontWeight="label" color="text1">
            This proposal has been replaced
          </Text>
        </Stack>
      </Flex>

      <Link link={replacementLink}>
        <Button variant="secondary" size="sm">
          <Flex align="center" gap="x2">
            View Latest Version
            <Icon id="arrow-right" size="sm" />
          </Flex>
        </Button>
      </Link>
    </Flex>
  )
}
