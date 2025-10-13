import { useAvailableUpgrade } from '@buildeross/hooks/useAvailableUpgrade'
import { DaoContractAddresses, useChainStore, useProposalStore } from '@buildeross/stores'
import { UpgradeCard } from '@buildeross/ui/UpgradeCard'
import { Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { FixRendererBase } from '../FixRendererBase'
import { v1_1_0, v1_2_0, v2_0_0 } from './versions'

export const VERSION_PROPOSAL_SUMMARY: { [key: string]: string } = {
  '2.0.0': v2_0_0,
  '1.2.0': v1_2_0,
  '1.1.0': v1_1_0,
}

export const Upgrade = ({
  hasThreshold,
  collection,
  addresses,
  onOpenProposalReview,
}: {
  hasThreshold: boolean
  collection: string
  addresses: DaoContractAddresses
  onOpenProposalReview: () => void
}) => {
  const createProposal = useProposalStore((state) => state.createProposal)
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

  if (!shouldUpgrade)
    return (
      <FixRendererBase
        {...{ hasThreshold, collection, addresses, onOpenProposalReview }}
      />
    )

  const handleUpgrade = (): void => {
    createProposal({
      transactions: [upgradeTransaction!],
      disabled: true,
      title: `Nouns Builder Upgrade v${latest} ${dayjs().format('YYYY-MM-DD')}`,
      summary: VERSION_PROPOSAL_SUMMARY?.[latest as string] || '',
    })

    onOpenProposalReview()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={'init'}
        animate={'open'}
        variants={{
          init: {
            height: 0,
            overflow: 'hidden',
            transition: {
              animate: 'easeInOut',
            },
          },
          open: {
            height: 'auto',
            transition: {
              animate: 'easeInOut',
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
  )
}
