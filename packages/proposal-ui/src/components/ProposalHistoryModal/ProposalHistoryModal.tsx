import { useProposalVersionHistory } from '@buildeross/hooks'
import { type Proposal } from '@buildeross/sdk/subgraph'
import { useChainStore } from '@buildeross/stores'
import { DropdownSelect, type SelectOption } from '@buildeross/ui/DropdownSelect'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Button, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { ProposalVersionDiffModal } from '../ProposalVersionDiffModal'

type ProposalHistoryModalProps = {
  proposal: Proposal
  open: boolean
  onClose: () => void
}

export const ProposalHistoryModal: React.FC<ProposalHistoryModalProps> = ({
  proposal,
  open,
  onClose,
}) => {
  const { chain } = useChainStore()
  const [selectedVersionIndex, setSelectedVersionIndex] = React.useState<number | null>(
    null
  )
  const [diffModalOpen, setDiffModalOpen] = React.useState(false)

  const { versions, isLoading } = useProposalVersionHistory({
    chainId: chain.id,
    daoAddress: proposal.dao.tokenAddress,
    proposalNumber: proposal.proposalNumber,
    enabled: open, // Only fetch when modal is open
  })

  // Create dropdown options from versions
  const versionOptions: SelectOption<number>[] = React.useMemo(() => {
    return versions.map((version, index) => {
      const isOriginal = index === 0
      const isLatest = index === versions.length - 1
      const date = new Date(Number(version.timeCreated) * 1000).toLocaleDateString()
      const time = new Date(Number(version.timeCreated) * 1000).toLocaleTimeString()

      let label = isOriginal ? 'Original Proposal' : `Update ${index}`
      if (isLatest) label += ' (Current)'

      return {
        value: index,
        label,
        description: version.updateMessage
          ? `${date} ${time} - ${version.updateMessage}`
          : `${date} ${time}`,
      }
    })
  }, [versions])

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
      <AnimatedModal open={open} close={onClose} size="medium">
        <Flex direction="column" gap="x6" p="x6">
          <Flex justify="space-between" align="center">
            <Text fontSize={28} fontWeight="display">
              Edit History
            </Text>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </Flex>

          {isLoading ? (
            <Text color="text3">Loading version history...</Text>
          ) : versions.length > 0 ? (
            <Stack gap="x4">
              <Text color="text3">
                This proposal has been edited {versions.length - 1}{' '}
                {versions.length - 1 === 1 ? 'time' : 'times'}. Select a version to view
                changes.
              </Text>

              <DropdownSelect
                options={versionOptions}
                value={undefined}
                onChange={handleVersionSelect}
                inputLabel="Select a version to view"
                customLabel="Select version..."
                positioning="inline"
                height="x14"
              />
            </Stack>
          ) : (
            <Text color="text3">No edit history available.</Text>
          )}
        </Flex>
      </AnimatedModal>

      {selectedVersion && (
        <ProposalVersionDiffModal
          open={diffModalOpen}
          onClose={handleCloseDiffModal}
          currentVersion={selectedVersion}
          previousVersion={previousVersion}
          versionIndex={selectedVersionIndex!}
          isOriginal={selectedVersionIndex === 0}
        />
      )}
    </>
  )
}
