import type { AddressType } from '@buildeross/types'
import { Button, Flex } from '@buildeross/zord'
import Link from 'next/link'
import React, { useState } from 'react'

import { actionButtons } from './CreateActions.css'
import { DaoSelectorModal } from './DaoSelectorModal'

export interface CreateActionsProps {
  userAddress?: AddressType
}

export const CreateActions: React.FC<CreateActionsProps> = ({ userAddress }) => {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [actionType, setActionType] = useState<'post' | 'proposal'>('post')

  const handleCreatePost = () => {
    setActionType('post')
    setSelectorOpen(true)
  }

  const handleCreateProposal = () => {
    setActionType('proposal')
    setSelectorOpen(true)
  }

  return (
    <>
      <Flex direction="column" className={actionButtons} gap="x3">
        <Flex gap="x3">
          <Button onClick={handleCreatePost} variant="primary" style={{ flex: 1 }}>
            Create Post
          </Button>
          <Button onClick={handleCreateProposal} variant="outline" style={{ flex: 1 }}>
            Create Proposal
          </Button>
        </Flex>
        <Button
          as={Link}
          href="/create"
          style={{ width: '100%', flex: 1 }}
          variant="secondaryOutline"
        >
          Create a DAO
        </Button>
      </Flex>

      <DaoSelectorModal
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        actionType={actionType}
        userAddress={userAddress}
      />
    </>
  )
}
