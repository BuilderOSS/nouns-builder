import { useAvailableUpgrade } from '@buildeross/hooks/useAvailableUpgrade'
import { DaoContractAddresses, useChainStore, useProposalStore } from '@buildeross/stores'
import { CHAIN_ID } from '@buildeross/types'
import { UpgradeCard } from '@buildeross/ui/UpgradeCard'
import { Flex, Text } from '@buildeross/zord'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import React from 'react'

import { FixRendererBase } from '../FixRendererBase'
import { ManagerV2Upgrade } from './ManagerV2Upgrade'
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
  const startProposalDraft = useProposalStore((state) => state.startProposalDraft)
  const chain = useChainStore((x) => x.chain)
  const isManagerV2UpgradeDao =
    chain.id === CHAIN_ID.ETHEREUM &&
    collection.toLowerCase() === '0xdf9b7d26c8fc806b1ae6273684556761ff02d422' &&
    addresses.treasury?.toLowerCase() === '0xdc9b96ea4966d063dd5c8dbaf08fe59062091b6d'

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
      <>
        {isManagerV2UpgradeDao && (
          <ManagerV2Upgrade
            hasThreshold={hasThreshold}
            onOpenProposalReview={onOpenProposalReview}
          />
        )}
        <FixRendererBase
          {...{ hasThreshold, collection, addresses, onOpenProposalReview }}
        />
      </>
    )

  const handleUpgrade = (): void => {
    startProposalDraft({
      transactions: [upgradeTransaction!],
      disabled: true,
      title: `Nouns Builder Upgrade v${latest} ${dayjs().format('YYYY-MM-DD')}`,
      summary: VERSION_PROPOSAL_SUMMARY?.[latest as string] || '',
    })

    onOpenProposalReview()
  }

  return (
    <>
      {isManagerV2UpgradeDao && (
        <ManagerV2Upgrade
          hasThreshold={hasThreshold}
          onOpenProposalReview={onOpenProposalReview}
        />
      )}
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
    </>
  )
}
