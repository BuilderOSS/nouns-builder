import { COINING_ENABLED } from '@buildeross/constants/coining'
import type { AddressType } from '@buildeross/types'
import { Button, Flex, Grid } from '@buildeross/zord'
import Link from 'next/link'
import React, { useState } from 'react'

import { actionButtons, daoButton } from './CreateActions.css'
import { DaoSelectorModal } from './DaoSelectorModal'

export interface CreateActionsProps {
  userAddress?: AddressType
}

export const CreateActions: React.FC<CreateActionsProps> = ({ userAddress }) => {
  const [selectorOpen, setSelectorOpen] = useState(false)
  const [actionType, setActionType] = useState<'post' | 'proposal'>(
    COINING_ENABLED ? 'post' : 'proposal'
  )

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
        {COINING_ENABLED ? (
          <>
            <Flex gap="x3">
              <Button onClick={handleCreatePost} variant="primary" style={{ flex: 1 }}>
                Create Post
              </Button>
              <Button
                onClick={handleCreateProposal}
                variant="outline"
                style={{ flex: 1 }}
              >
                Create Proposal
              </Button>
            </Flex>
            <Link href="/create" style={{ width: '100%', flex: 1 }}>
              <Button style={{ width: '100%' }} variant="outline" className={daoButton}>
                Create a DAO
              </Button>
            </Link>
          </>
        ) : (
          <>
            <Grid columns={2} gap="x3">
              <Button
                onClick={handleCreateProposal}
                variant="primary"
                style={{ flex: 1 }}
              >
                Create Proposal
              </Button>
              <Link href="/create" style={{ flex: 1 }}>
                <Button variant="outline" style={{ width: '100%' }}>
                  Create a DAO
                </Button>
              </Link>
            </Grid>
          </>
        )}
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
