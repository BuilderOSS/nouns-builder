import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { COIN_SUPPORTED_CHAIN_IDS, COINING_ENABLED } from '@buildeross/constants/coining'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { modalBody, modalFooter, modalHeader, modalTitle } from './DaoSelectorModal.css'
import { type DaoListItem, SingleDaoSelector } from './SingleDaoSelector'

export interface DaoSelectorModalProps {
  open: boolean
  onClose: () => void
  actionType: 'post' | 'proposal'
  userAddress?: AddressType
}

export const DaoSelectorModal: React.FC<DaoSelectorModalProps> = ({
  open,
  onClose,
  actionType,
  userAddress,
}) => {
  const router = useRouter()
  const [selectedDao, setSelectedDao] = useState<DaoListItem | undefined>()

  const isForPost = actionType === 'post' && COINING_ENABLED

  const title = isForPost ? 'Select DAO for Post' : 'Select DAO for Proposal'
  const description = isForPost
    ? 'Choose which DAO you want to create a post for'
    : 'Choose which DAO you want to create a proposal for (members only)'

  const handleContinue = async () => {
    if (!selectedDao) return

    // Get the chain name from chain ID
    const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === selectedDao.chainId)
    if (!chain) {
      console.error('Chain not found for DAO')
      return
    }

    const network = chain.slug

    if (isForPost) {
      // Route: /dao/{network}/{token}/coin/create
      await router.push(`/dao/${network}/${selectedDao.address}/coin/create`)
    } else {
      // Route: /dao/{network}/{token}/proposal/create
      await router.push(`/dao/${network}/${selectedDao.address}/proposal/create`)
    }

    onClose()
  }

  const handleCancel = () => {
    setSelectedDao(undefined)
    onClose()
  }

  // For posts: show search, For proposals: no search (members only)
  const showSearch = isForPost

  // For posts: filter to coin-supported chains
  const effectiveChainIds = (isForPost ? COIN_SUPPORTED_CHAIN_IDS : []) as CHAIN_ID[]

  return (
    <AnimatedModal open={open} close={handleCancel} size="large">
      <Stack>
        <div className={modalHeader}>
          <Flex align="center" gap="x2" mb="x3" justify="space-between">
            <Box>
              <Text className={modalTitle}>{title}</Text>
              <Text fontSize="14" color="text3" style={{ marginTop: '4px' }}>
                {description}
              </Text>
            </Box>
            <Button
              variant="ghost"
              onClick={handleCancel}
              p={'x0'}
              size="xs"
              style={{ padding: 0, flexShrink: 0 }}
            >
              <Icon id="cross" />
            </Button>
          </Flex>
        </div>

        <div className={modalBody}>
          <SingleDaoSelector
            chainIds={effectiveChainIds}
            selectedDaoAddress={selectedDao?.address}
            onSelectedDaoChange={setSelectedDao}
            userAddress={userAddress}
            showSearch={showSearch}
            actionType={actionType}
          />
        </div>

        <Flex className={modalFooter}>
          <Button variant="ghost" onClick={handleCancel} type="button">
            Cancel
          </Button>
          <Button onClick={handleContinue} type="button" disabled={!selectedDao}>
            Continue
          </Button>
        </Flex>
      </Stack>
    </AnimatedModal>
  )
}
