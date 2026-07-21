import { useProposalVersionHistory } from '@buildeross/hooks'
import { type Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { DropdownSelect, type SelectOption } from '@buildeross/ui/DropdownSelect'
import { Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ProposalVersionDiffModal } from '../ProposalVersionDiffModal'
import * as styles from './ProposalEditedBanner.css'

type ProposalEditedBannerProps = {
  proposal: Proposal
  onViewHistory?: () => void
}

export const ProposalEditedBanner: React.FC<ProposalEditedBannerProps> = ({
  proposal,
}) => {
  const { chain } = useChainStore()
  const [selectedVersionIndex, setSelectedVersionIndex] = React.useState<number | null>(
    null
  )
  const [diffModalOpen, setDiffModalOpen] = React.useState(false)
  const [dropdownEnabled, setDropdownEnabled] = React.useState(false)

  const { versions, isLoading } = useProposalVersionHistory({
    chainId: chain.id,
    daoAddress: proposal.dao.tokenAddress,
    proposalNumber: proposal.proposalNumber,
    enabled: dropdownEnabled,
  })

  // Create dropdown options from versions (exclude original, only show updates)
  const versionOptions: SelectOption<number>[] = React.useMemo(() => {
    // Skip the first version (original) and map the rest as updates
    return versions.slice(1).map((version, index) => {
      const versionIndex = index + 1 // Actual index in the versions array
      const updateNumber = index + 1 // Update number (1, 2, 3, etc.)
      const isLatest = versionIndex === versions.length - 1
      const date = new Date(Number(version.timeCreated) * 1000).toLocaleDateString()
      const time = new Date(Number(version.timeCreated) * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      let label = `Update ${updateNumber}`
      if (isLatest) label += ' (Latest)'

      return {
        value: versionIndex, // Use actual index from versions array
        label,
        description: version.updateMessage
          ? `${date} ${time} - ${version.updateMessage}`
          : `${date} ${time}`,
      }
    })
  }, [versions])

  // Enable dropdown when banner is mounted
  React.useEffect(() => {
    setDropdownEnabled(true)
  }, [])

  // Only show if this proposal replaces another (meaning it's been updated)
  if (!proposal.replaces) {
    return null
  }

  const handleVersionSelect = (index: number) => {
    setSelectedVersionIndex(index)
    setDiffModalOpen(true)
  }

  const handleCloseDiffModal = () => {
    setDiffModalOpen(false)
    setSelectedVersionIndex(null)
  }

  const selectedVersion =
    selectedVersionIndex !== null ? versions[selectedVersionIndex] : null
  const previousVersion =
    selectedVersionIndex !== null && selectedVersionIndex > 0
      ? versions[selectedVersionIndex - 1]
      : null

  return (
    <>
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
              This proposal has been edited
            </Text>
          </Stack>
        </Flex>

        <Flex style={{ marginBottom: '-32px', paddingBottom: '16px' }}>
          <DropdownSelect
            options={versionOptions}
            value={undefined}
            onChange={handleVersionSelect}
            customLabel="View Edit History"
            positioning="absolute"
            variant="button"
            buttonVariant="secondary"
            buttonSize="sm"
            align="right"
            isLoading={isLoading}
            minWidth="300px"
          />
        </Flex>
      </Flex>

      <ProposalVersionDiffModal
        open={diffModalOpen && !!selectedVersion}
        onClose={handleCloseDiffModal}
        currentVersion={selectedVersion}
        previousVersion={previousVersion}
        versionIndex={selectedVersionIndex!}
        isOriginal={selectedVersionIndex === 0}
      />
    </>
  )
}
