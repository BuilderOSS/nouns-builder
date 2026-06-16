import { ProposalVersionDiffModal } from '@buildeross/proposal-ui'
import { type CandidateVersionFragmentFragment } from '@buildeross/sdk'
import { type ProposalVersion } from '@buildeross/sdk/subgraph'
import { DropdownSelect, type SelectOption } from '@buildeross/ui/DropdownSelect'
import { Box, Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

type CandidateVersionLike = CandidateVersionFragmentFragment & {
  proposer: string
}

type CandidateEditedBannerProps = {
  proposer: string
  versions: CandidateVersionFragmentFragment[]
}

const sortVersions = (versions: CandidateVersionFragmentFragment[]) =>
  [...versions].sort(
    (a, b) => Number(a.versionNumber) - Number(b.versionNumber)
  ) as CandidateVersionFragmentFragment[]

const toProposalVersion = (version: CandidateVersionLike): ProposalVersion =>
  ({
    ...version,
    proposer: version.proposer,
    targets: version.targets.map((value) => value.toString()),
    values: version.values.map((value) => value.toString()),
    calldatas: version.calldatas.map((value) => value.toString()),
    transactionHash: version.proposalId.toString(),
    state: 'PENDING' as any,
    updatePeriodEnd: undefined,
  }) as unknown as ProposalVersion

export const CandidateEditedBanner: React.FC<CandidateEditedBannerProps> = ({
  proposer,
  versions,
}) => {
  const sortedVersions = React.useMemo(() => sortVersions(versions), [versions])
  const [selectedVersionIndex, setSelectedVersionIndex] = React.useState<number | null>(
    null
  )
  const [diffModalOpen, setDiffModalOpen] = React.useState(false)

  const enrichedVersions = React.useMemo(
    () =>
      sortedVersions.map((version) => ({
        ...version,
        proposer,
      })) as CandidateVersionLike[],
    [proposer, sortedVersions]
  )

  const versionOptions: SelectOption<number>[] = React.useMemo(() => {
    return enrichedVersions.map((version, index) => {
      const isOriginal = index === 0
      const isLatest = index === enrichedVersions.length - 1
      const date = new Date(Number(version.createdAt) * 1000).toLocaleDateString()
      const time = new Date(Number(version.createdAt) * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })

      let label = isOriginal
        ? 'Original Version'
        : `Version ${Number(version.versionNumber)}`
      if (isLatest) label += ' (Current)'

      return {
        value: index,
        label,
        description: `${date} ${time}`,
      }
    })
  }, [enrichedVersions])

  if (sortedVersions.length <= 1) {
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
    selectedVersionIndex !== null ? enrichedVersions[selectedVersionIndex] : null
  const previousVersion =
    selectedVersionIndex !== null && selectedVersionIndex > 0
      ? enrichedVersions[selectedVersionIndex - 1]
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
        <Flex align="center" gap="x3">
          <Icon id="refresh" size="md" color="warning" />
          <Stack gap="x1">
            <Text fontWeight="label" color="text1">
              This candidate has been edited
            </Text>
            <Text color="text3">
              This candidate has been edited {sortedVersions.length - 1}{' '}
              {sortedVersions.length - 1 === 1 ? 'time' : 'times'}. Select a version to
              view changes.
            </Text>
          </Stack>
        </Flex>

        <Box>
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
            minWidth="300px"
          />
        </Box>
      </Flex>

      <ProposalVersionDiffModal
        open={diffModalOpen && !!selectedVersion}
        onClose={handleCloseDiffModal}
        currentVersion={selectedVersion ? toProposalVersion(selectedVersion) : null}
        previousVersion={previousVersion ? toProposalVersion(previousVersion) : null}
        versionIndex={selectedVersion ? Number(selectedVersion.versionNumber) : 0}
        isOriginal={selectedVersionIndex === 0}
        versionLabel="Version"
      />
    </>
  )
}
