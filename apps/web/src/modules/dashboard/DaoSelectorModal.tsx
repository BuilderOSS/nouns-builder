import { PUBLIC_ALL_CHAINS } from '@buildeross/constants/chains'
import { useUserDaos } from '@buildeross/hooks'
import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { AnimatedModal } from '@buildeross/ui'
import { Button, Flex, Stack, Text } from '@buildeross/zord'
import { useRouter } from 'next/router'
import React, { useMemo, useState } from 'react'

import { modalBody, modalFooter, modalHeader, modalTitle } from './DaoSelectorModal.css'
import { SingleDaoSelector } from './SingleDaoSelector'

export interface DaoSelectorModalProps {
  open: boolean
  onClose: () => void
  actionType: 'post' | 'proposal'
  userAddress?: AddressType
  chainIds?: CHAIN_ID[]
}

export const DaoSelectorModal: React.FC<DaoSelectorModalProps> = ({
  open,
  onClose,
  actionType,
  userAddress,
  chainIds = [],
}) => {
  const router = useRouter()
  const [selectedDao, setSelectedDao] = useState<AddressType | undefined>()

  // Fetch user's DAOs to get chain info for routing
  const { daos: userDaos } = useUserDaos({
    address: userAddress,
    enabled: !!userAddress,
  })

  const title = useMemo(() => {
    return actionType === 'post' ? 'Select DAO for Post' : 'Select DAO for Proposal'
  }, [actionType])

  const description = useMemo(() => {
    if (actionType === 'post') {
      return 'Choose which DAO you want to create a post for'
    }
    return 'Choose which DAO you want to create a proposal for (members only)'
  }, [actionType])

  const handleContinue = async () => {
    if (!selectedDao) return

    // Find the DAO details from user's DAOs
    const selectedDaoData = userDaos.find(
      (dao) => dao.collectionAddress.toLowerCase() === selectedDao.toLowerCase()
    )

    if (!selectedDaoData) {
      console.error('Selected DAO not found in user DAOs')
      return
    }

    // Get the chain name from chain ID
    const chain = PUBLIC_ALL_CHAINS.find((c) => c.id === selectedDaoData.chainId)
    if (!chain) {
      console.error('Chain not found for DAO')
      return
    }

    const network = chain.slug

    if (actionType === 'post') {
      // Route: /dao/{network}/{token}/post/create
      await router.push(
        `/dao/${network}/${selectedDaoData.collectionAddress}/post/create`
      )
    } else {
      // Route: /dao/{network}/{token}/proposal/create (existing route)
      await router.push(
        `/dao/${network}/${selectedDaoData.collectionAddress}/proposal/create`
      )
    }

    onClose()
  }

  const handleCancel = () => {
    setSelectedDao(undefined)
    onClose()
  }

  // For posts: show search, For proposals: no search (members only)
  const showSearch = actionType === 'post'

  return (
    <AnimatedModal open={open} close={handleCancel} size="large">
      <Stack>
        <div className={modalHeader}>
          <Text className={modalTitle}>{title}</Text>
          <Text fontSize="14" color="text3" style={{ marginTop: '4px' }}>
            {description}
          </Text>
        </div>

        <div className={modalBody}>
          <SingleDaoSelector
            chainIds={chainIds}
            selectedDaoAddress={selectedDao}
            onSelectedDaoChange={setSelectedDao}
            userAddress={userAddress}
            showSearch={showSearch}
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
