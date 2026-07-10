import { useAvailableUpgrade } from '@buildeross/hooks/useAvailableUpgrade'
import {
  createSetUpdatablePeriodTransaction,
  governorAbi,
} from '@buildeross/sdk/contract'
import { DaoContractAddresses, useChainStore, useProposalStore } from '@buildeross/stores'
import { UpgradeCard } from '@buildeross/ui/UpgradeCard'
import { Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
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
      const setUpdatablePeriodTx = createSetUpdatablePeriodTransaction({
        governorAddress: addresses.governor as `0x${string}`,
        proposalUpdatablePeriod: updatablePeriodSeconds,
      })
      transactions[0].transactions.push(setUpdatablePeriodTx)
    }

    // Generate summary with dynamic updatable period for v3.0.0
    let summary = VERSION_PROPOSAL_SUMMARY?.[latest as string] || ''
    if (isV3Upgrade) {
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
    }

    startProposalDraft({
      transactions,
      disabled: true,
      title: `Nouns Builder Upgrade v${latest} ${dayjs().format('YYYY-MM-DD')}`,
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
      />
    </>
  )
}
