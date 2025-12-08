import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { Button, Flex } from '@buildeross/zord'
import React, { useState } from 'react'

import { actionButtons } from './CreateActions.css'
import { DaoSelectorModal } from './DaoSelectorModal'

export interface CreateActionsProps {
  userAddress?: AddressType
  chainIds?: CHAIN_ID[]
}

export const CreateActions: React.FC<CreateActionsProps> = ({
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
      <Flex className={actionButtons} gap="x3">
        <Button onClick={handleCreateProposal} style={{ flex: 1 }}>
          Create Proposal
        </Button>
        <Button onClick={handleCreateDao} variant="outline" style={{ flex: 1 }}>
          Create a DAO
        </Button>
      </Flex>

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
