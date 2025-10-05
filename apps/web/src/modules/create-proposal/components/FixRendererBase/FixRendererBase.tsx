import { Flex, Text } from '@buildeross/zord'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/router'
import React from 'react'
import { useChainStore } from 'src/stores/useChainStore'
import { DaoContractAddresses } from 'src/stores/useDaoStore'

import { useRendererBaseFix } from '../../hooks'
import { useProposalStore } from '../../stores'
import { UpgradeCard } from '../UpgradeCard'
import { default as summary } from './summary.md'

export const FixRendererBase = ({
  hasThreshold,
  collection,
  addresses,
}: {
  hasThreshold: boolean
  collection: string
  addresses: DaoContractAddresses
}) => {
  const { push } = useRouter()
  const createProposal = useProposalStore((state) => state.createProposal)
  const chain = useChainStore((x) => x.chain)

  const { description, transaction, shouldFix } = useRendererBaseFix({
    chainId: chain.id,
    addresses,
  })

  if (!shouldFix) return null

  const handleUpgrade = (): void => {
    createProposal({
      transactions: [transaction!],
      disabled: true,
      title: `Fix Metadata Renderer Base`,
      summary,
    })

    push({
      pathname: '/dao/[network]/[token]/proposal/review',
      query: { network: chain.slug, token: collection },
    })
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
            version="- Fix Metadata Renderer Base"
            onUpgrade={handleUpgrade}
            hasThreshold={hasThreshold}
            description={description}
          />
        </Flex>
      </motion.div>
    </AnimatePresence>
  )
}
