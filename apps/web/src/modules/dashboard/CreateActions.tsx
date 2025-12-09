import type { AddressType, CHAIN_ID } from '@buildeross/types'
import { Button, Flex } from '@buildeross/zord'
import Link from 'next/link'
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

  return (
    <>
      <Flex className={actionButtons} gap="x3">
        <Button onClick={handleCreateProposal} style={{ flex: 1 }}>
          Create Proposal
        </Button>
        <Link href="/create" passHref>
          <Button variant="outline" style={{ flex: 1 }}>
            Create a DAO
          </Button>
        </Link>
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
