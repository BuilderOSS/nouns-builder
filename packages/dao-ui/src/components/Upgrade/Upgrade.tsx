import { useAvailableUpgrade } from '@buildeross/hooks/useAvailableUpgrade'
import {
  createSetUpdatablePeriodTransaction,
  governorAbi,
} from '@buildeross/sdk/contract'
import { DaoContractAddresses, useChainStore, useProposalStore } from '@buildeross/stores'
import { UpgradeCard } from '@buildeross/ui/UpgradeCard'
import { Flex, Text } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'
import { useReadContract } from 'wagmi'

import { FixRendererBase } from '../FixRendererBase'
import { ConfigureUpdatablePeriodModal } from './ConfigureUpdatablePeriodModal'
import { v1_1_0, v1_2_0, v2_0_0, v3_0_0 } from './versions'

export const VERSION_PROPOSAL_SUMMARY: { [key: string]: string } = {
  '3.0.0': v3_0_0,
  '2.0.0': v2_0_0,
  '1.2.0': v1_2_0,
  '1.1.0': v1_1_0,
}

export const Upgrade = ({
  hasThreshold,
  collection,
  addresses,
  daoName,
  onOpenProposalReview,
}: {
  hasThreshold: boolean
  collection: string
  addresses: DaoContractAddresses
  daoName?: string
  onOpenProposalReview: () => void
}) => {
  const startProposalDraft = useProposalStore((state) => state.startProposalDraft)
  const chain = useChainStore((x) => x.chain)

  const {
    latest,
    date,
    description,
    transaction: upgradeTransaction,
    totalContractUpgrades,
    shouldUpgrade,
  } = useAvailableUpgrade({
    chainId: chain.id,
    addresses,
  })

  // Fetch current voting period from Governor contract
  const { data: votingPeriodSeconds } = useReadContract({
    address: addresses.governor as `0x${string}`,
    abi: governorAbi,
    functionName: 'votingPeriod',
    chainId: chain.id,
    query: {
      enabled: !!addresses.governor && latest === '3.0.0',
    },
  })

  // Calculate default updatable period: min(votingPeriod, 1 day)
  const defaultUpdatablePeriodSeconds = React.useMemo(() => {
    if (!votingPeriodSeconds) return 86400 // Default to 1 day
    const oneDayInSeconds = 86400
    return Math.min(Number(votingPeriodSeconds), oneDayInSeconds)
  }, [votingPeriodSeconds])

  // Convert seconds to days/hours/minutes/seconds
  const defaultUpdatablePeriod = React.useMemo(() => {
    const totalSeconds = defaultUpdatablePeriodSeconds
    const days = Math.floor(totalSeconds / 86400)
    const hours = Math.floor((totalSeconds % 86400) / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return { days, hours, minutes, seconds }
  }, [defaultUpdatablePeriodSeconds])

  // State for updatable period (only for v3.0.0+)
  const [updatablePeriod, setUpdatablePeriod] = React.useState(defaultUpdatablePeriod)
  const [showModal, setShowModal] = React.useState(false)
  const [enableUpdatablePeriod, setEnableUpdatablePeriod] = React.useState(true)

  // Update state when default changes
  React.useEffect(() => {
    setUpdatablePeriod(defaultUpdatablePeriod)
  }, [defaultUpdatablePeriod])

  // Calculate updatable period in seconds
  const updatablePeriodSeconds =
    updatablePeriod.days * 86400 +
    updatablePeriod.hours * 3600 +
    updatablePeriod.minutes * 60 +
    updatablePeriod.seconds

  // Validation: updatable period must not exceed voting period
  const exceedsVotingPeriod =
    votingPeriodSeconds && updatablePeriodSeconds > Number(votingPeriodSeconds)

  const isV3Upgrade = latest === '3.0.0'

  if (!shouldUpgrade)
    return (
      <FixRendererBase
        {...{ hasThreshold, collection, addresses, onOpenProposalReview }}
      />
    )

  const handleUpgrade = (): void => {
    // For v3.0.0 upgrades, show modal first to collect updatable period
    if (isV3Upgrade) {
      setShowModal(true)
      return
    }

    // For other versions, proceed directly
    proceedWithUpgrade()
  }

  const proceedWithUpgrade = (): void => {
    const transactions = [upgradeTransaction!]

    // For v3.0.0 upgrades, append the setUpdatablePeriod transaction
    if (isV3Upgrade && addresses.governor) {
      const periodToSet = enableUpdatablePeriod ? updatablePeriodSeconds : 0
      const setUpdatablePeriodTx = createSetUpdatablePeriodTransaction({
        governorAddress: addresses.governor as `0x${string}`,
        proposalUpdatablePeriod: periodToSet,
      })
      transactions[0].transactions.push(setUpdatablePeriodTx)
    }

    // Generate summary with dynamic updatable period for v3.0.0
    let summary = VERSION_PROPOSAL_SUMMARY?.[latest as string] || ''
    if (isV3Upgrade) {
      if (enableUpdatablePeriod) {
        // Format the selected updatable period
        const periodParts = []
        if (updatablePeriod.days > 0)
          periodParts.push(
            `${updatablePeriod.days} day${updatablePeriod.days > 1 ? 's' : ''}`
          )
        if (updatablePeriod.hours > 0)
          periodParts.push(
            `${updatablePeriod.hours} hour${updatablePeriod.hours > 1 ? 's' : ''}`
          )
        if (updatablePeriod.minutes > 0)
          periodParts.push(
            `${updatablePeriod.minutes} minute${updatablePeriod.minutes > 1 ? 's' : ''}`
          )
        if (updatablePeriod.seconds > 0)
          periodParts.push(
            `${updatablePeriod.seconds} second${updatablePeriod.seconds > 1 ? 's' : ''}`
          )
        const periodText = periodParts.join(', ') || '0 seconds'

        // Replace placeholders with actual selected period
        summary = summary
          .replace(/\{\{UPDATABLE_PERIOD\}\}/g, periodText)
          .replace(
            /\{\{UPDATABLE_PERIOD_SECONDS\}\}/g,
            updatablePeriodSeconds.toLocaleString()
          )
      } else {
        // When disabled, rewrite sections to reflect disabled state

        // 1. Replace the "Updatable Proposals" section
        const updatableProposalsSection =
          /### Updatable Proposals[\s\S]*?(?=### Signed Proposals)/
        const disabledSection = `### Updatable Proposals

**The updatable proposals feature is being disabled for this DAO** (updatable period set to 0 seconds).

- Proposals cannot be edited after creation
- This maintains the traditional governance model where proposals are immutable once submitted
- You can enable this feature later by creating a proposal to set a non-zero updatable period

`
        if (updatableProposalsSection.test(summary)) {
          summary = summary.replace(updatableProposalsSection, disabledSection)
        }

        // 2. Update "New Proposal States" section to remove updatable-related states
        const newProposalStatesSection =
          /### New Proposal States[\s\S]*?(?=### Proposal Replacement Tracking)/
        const disabledStatesSection = `### New Proposal States

Since updatable proposals are disabled, the standard proposal states will be used (Pending, Active, Defeated, Succeeded, Queued, Executed, Canceled, Vetoed, Expired).

`
        if (newProposalStatesSection.test(summary)) {
          summary = summary.replace(newProposalStatesSection, disabledStatesSection)
        }

        // 3. Update "Proposal Replacement Tracking" section
        const replacementTrackingSection =
          /### Proposal Replacement Tracking[\s\S]*?(?=### Technical Details)/
        const disabledTrackingSection = `### Proposal Replacement Tracking

Proposal replacement tracking is not applicable when updatable proposals are disabled.

`
        if (replacementTrackingSection.test(summary)) {
          summary = summary.replace(replacementTrackingSection, disabledTrackingSection)
        }

        // 4. Replace remaining placeholders with cleaner text
        summary = summary
          .replace(/\{\{UPDATABLE_PERIOD\}\}/g, 'disabled')
          .replace(/\{\{UPDATABLE_PERIOD_SECONDS\}\}/g, '0')
      }
    }

    startProposalDraft({
      transactions,
      disabled: true,
      title: `Upgrade to Nouns Builder v${latest}`,
      summary,
    })

    setShowModal(false)
    onOpenProposalReview()
  }

  const handleUpdatablePeriodChange = (field: string, value: number) => {
    setUpdatablePeriod((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={'init'}
          animate={'open'}
          variants={{
            init: {
              height: 0,
              overflow: 'hidden',
              transition: {
                ease: 'easeInOut',
              },
            },
            open: {
              height: 'auto',
              transition: {
                ease: 'easeInOut',
              },
            },
          }}
        >
          <Flex direction={'column'} mt={'x6'}>
            <Text color="text3" mb={'x4'}>
              Upgrade Available
            </Text>

            <UpgradeCard
              onUpgrade={handleUpgrade}
              hasThreshold={hasThreshold}
              version={latest}
              date={date}
              description={description}
              totalContractUpgrades={totalContractUpgrades}
            />
          </Flex>
        </motion.div>
      </AnimatePresence>

      {/* Modal for v3.0.0 upgrades to configure updatable period */}
      <ConfigureUpdatablePeriodModal
        open={showModal}
        close={() => setShowModal(false)}
        updatablePeriod={updatablePeriod}
        onUpdatablePeriodChange={handleUpdatablePeriodChange}
        exceedsVotingPeriod={!!exceedsVotingPeriod}
        hasThreshold={hasThreshold}
        onContinue={proceedWithUpgrade}
        votingPeriodSeconds={votingPeriodSeconds}
        updatablePeriodSeconds={updatablePeriodSeconds}
        daoName={daoName}
        enableUpdatablePeriod={enableUpdatablePeriod}
        onEnableUpdatablePeriodChange={setEnableUpdatablePeriod}
      />
    </>
  )
}
