import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { Icon, Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'

import { DaoSelectorModal } from './DaoSelectorModal'
import {
  createMenuCard,
  createMenuCardIcon,
  createMenuContainer,
  createMenuGrid,
  createMenuTitle,
} from './MobileCreateMenu.css'

export interface MobileCreateMenuProps {
  userAddress?: AddressType
  chainIds?: CHAIN_ID[]
}

export const MobileCreateMenu: React.FC<MobileCreateMenuProps> = ({
  userAddress,
  chainIds,
}) => {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [actionType, setActionType] = useState<'post' | 'proposal'>('post')

  const handleCreateProposal = () => {
    setActionType('proposal')
    setSelectorOpen(true)
  }

  const handleCreateDao = () => {
    window.open('https://nouns.build/create', '_blank', 'noopener,noreferrer')
  }

  return (
    <>
      <Stack className={createMenuContainer}>
        <Text className={createMenuTitle}>What would you like to create?</Text>

        <div className={createMenuGrid}>
          <button className={createMenuCard} onClick={handleCreateProposal} type="button">
            <Icon id="checkInCircle" className={createMenuCardIcon} />
            <Text fontSize="18" fontWeight="label">
              Create Proposal
            </Text>
            <Text fontSize="14" color="text3">
              Submit a governance proposal for DAO members to vote on
            </Text>
          </button>

          <button className={createMenuCard} onClick={handleCreateDao} type="button">
            <Icon id="plus" className={createMenuCardIcon} />
            <Text fontSize="18" fontWeight="label">
              Create a DAO
            </Text>
            <Text fontSize="14" color="text3">
              Launch your own DAO on Nouns Builder
            </Text>
          </button>
        </div>
      </Stack>

      <DaoSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        actionType={actionType}
        userAddress={userAddress}
        chainIds={chainIds}
      />
    </>
  )
}
