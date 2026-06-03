import { type ProposalVersion } from '@buildeross/sdk/subgraph'
import { AnimatedModal } from '@buildeross/ui/Modal'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React from 'react'

import { createInlineDiff, type DiffLine } from '../../utils/textDiff'
import { ProposalDescription } from '../ProposalDescription'
import * as styles from './ProposalVersionDiffModal.css'

type ProposalVersionDiffModalProps = {
  open: boolean
  onClose: () => void
  currentVersion: ProposalVersion | null
  previousVersion: ProposalVersion | null
  versionIndex: number
  isOriginal: boolean
}

type TabType = 'diff' | 'full'

export const ProposalVersionDiffModal: React.FC<ProposalVersionDiffModalProps> = ({
  open,
  onClose,
  currentVersion,
  previousVersion,
  versionIndex,
  isOriginal,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabType>('diff')

  // Reset to diff tab when modal opens
  React.useEffect(() => {
    if (open) {
      setActiveTab('diff')
    }
  }, [open])

  const renderDiffLines = (lines: DiffLine[]) => {
    return (
      <Box className={styles.diffContainer}>
        {lines.map((line, index) => {
          let lineClassName = styles.diffLineUnchanged
          let textClassName = styles.diffTextUnchanged
          let prefix = '  '

          if (line.type === 'added') {
            lineClassName = styles.diffLineAdded
            textClassName = styles.diffTextAdded
            prefix = '+ '
          } else if (line.type === 'removed') {
            lineClassName = styles.diffLineRemoved
            textClassName = styles.diffTextRemoved
            prefix = '- '
          }

          return (
            <Box key={index} className={lineClassName}>
              <Text className={textClassName}>
                {prefix}
                {line.content || ' '}
              </Text>
            </Box>
          )
        })}
      </Box>
    )
  }

  const renderDiff = () => {
    if (isOriginal) {
      return (
        <Text color="text3">
          This is the original proposal. There are no previous versions to compare
          against.
        </Text>
      )
    }

    if (!previousVersion) {
      return <Text color="text3">Unable to load previous version for comparison.</Text>
    }

    if (!currentVersion) {
      return <Text color="text3">Unable to load current version for comparison.</Text>
    }

    const titleDiff =
      currentVersion.title !== previousVersion.title
        ? createInlineDiff(previousVersion.title || '', currentVersion.title || '')
        : []

    const descriptionDiff =
      currentVersion.description !== previousVersion.description
        ? createInlineDiff(
            previousVersion.description || '',
            currentVersion.description || ''
          )
        : []

    const updateMessage = currentVersion.updateMessage

    return (
      <Stack gap="x6">
        {updateMessage && (
          <Stack gap="x2">
            <Text fontWeight="label" color="text3" fontSize={14}>
              Update Message
            </Text>
            <Box className={styles.updateMessageBox}>
              <Text>{updateMessage}</Text>
            </Box>
          </Stack>
        )}

        {titleDiff.length > 0 && (
          <Stack gap="x2">
            <Text fontWeight="label" color="text3" fontSize={14}>
              Title Changes
            </Text>
            {renderDiffLines(titleDiff)}
          </Stack>
        )}

        {descriptionDiff.length > 0 && (
          <Stack gap="x2">
            <Text fontWeight="label" color="text3" fontSize={14}>
              Description Changes
            </Text>
            {renderDiffLines(descriptionDiff)}
          </Stack>
        )}

        {titleDiff.length === 0 && descriptionDiff.length === 0 && (
          <Text color="text3">No changes to title or description in this update.</Text>
        )}

        {/* TODO: Add transaction diff */}
        <Text color="text3" fontSize={14}>
          Transaction comparison coming soon...
        </Text>
      </Stack>
    )
  }

  const renderFullVersion = () => {
    if (!previousVersion) {
      return <Text color="text3">Unable to load the previous version.</Text>
    }

    // For the full view, show the previous version (the older one)
    // since the current/latest version is already visible on the main page
    return (
      <Stack gap="x6">
        <ProposalDescription
          title={previousVersion.title || ''}
          proposal={previousVersion}
          onOpenProposalReview={async () => undefined}
          isPreview
          showMetadataSections={true}
        />
      </Stack>
    )
  }

  return (
    <AnimatedModal open={open} close={onClose} size="large">
      <Flex direction="column" gap="x6" p="x6">
        <Flex justify="space-between" align="center">
          <Text fontSize={28} fontWeight="display">
            {isOriginal ? 'Original Proposal' : `Update ${versionIndex}`}
          </Text>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </Flex>

        {/* Tabs */}
        <Flex gap="x2" className={styles.tabsContainer}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('diff')}
            className={`${styles.tabButton} ${activeTab === 'diff' ? styles.tabButtonActive : styles.tabButtonInactive}`}
          >
            Diff
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('full')}
            className={`${styles.tabButton} ${activeTab === 'full' ? styles.tabButtonActive : styles.tabButtonInactive}`}
          >
            Full Version
          </Button>
        </Flex>

        {/* Content */}
        <Box className={styles.modalContent}>
          {activeTab === 'diff' ? renderDiff() : renderFullVersion()}
        </Box>
      </Flex>
    </AnimatedModal>
  )
}
