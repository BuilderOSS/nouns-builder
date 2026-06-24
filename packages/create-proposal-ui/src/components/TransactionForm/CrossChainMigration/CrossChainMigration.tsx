import { chainIdToSlug } from '@buildeross/utils'
import { Box, Button, Flex, Stack, Text } from '@buildeross/zord'
import React, { useState } from 'react'

import {
  MigrationStep,
  useCrossChainMigration,
} from '../../../hooks/useCrossChainMigration'
import { MigrationProgressTracker } from './MigrationProgressTracker'
import { Step1_LoadConfig } from './Step1_LoadConfig'
import { Step2_ReviewConfig } from './Step2_ReviewConfig'
import { Step3_DeployDAO } from './Step3_DeployDAO'
import { Step4_SetupMetadata } from './Step4_SetupMetadata'
import { Step5_SetupMerkleRoots } from './Step5_SetupMerkleRoots'
import { Step6_SetDelayedGovernance } from './Step6_SetDelayedGovernance'
import { Step7_MintTokens } from './Step7_MintTokens'
import { Step8_SetAttributes } from './Step8_SetAttributes'
import { Step9_CreateProposal } from './Step9_CreateProposal'

/**
 * Cross-Chain Migration Transaction Form
 *
 * 9-step process:
 * 1. Load source DAO config and select target chain
 * 2. Review and edit configuration
 * 3. Deploy DAO on target chain
 * 4. Setup metadata properties
 * 5. Setup merkle roots
 * 6. Set delayed governance parameters
 * 7. Mint reserved tokens
 * 8. Set attributes (optional)
 * 9. Create proposal to pause auctions and bridge treasury
 */
export const CrossChainMigration: React.FC = () => {
  const { currentStep, targetChainId, targetAddresses, reset } = useCrossChainMigration()
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const targetChainSlug = targetChainId ? chainIdToSlug(targetChainId) : undefined
  const daoDeployed = !!targetChainSlug && !!targetAddresses?.token

  const renderStep = () => {
    switch (currentStep) {
      case MigrationStep.LOAD_CONFIG:
        return <Step1_LoadConfig />
      case MigrationStep.REVIEW_CONFIG:
        return <Step2_ReviewConfig />
      case MigrationStep.DEPLOY_DAO:
        return <Step3_DeployDAO />
      case MigrationStep.SETUP_METADATA:
        return <Step4_SetupMetadata />
      case MigrationStep.SETUP_MERKLE_ROOTS:
        return <Step5_SetupMerkleRoots />
      case MigrationStep.SET_DELAYED_GOVERNANCE:
        return <Step6_SetDelayedGovernance />
      case MigrationStep.MINT_TOKENS:
        return <Step7_MintTokens />
      case MigrationStep.SET_ATTRIBUTES:
        return <Step8_SetAttributes />
      case MigrationStep.CREATE_PROPOSAL:
        return <Step9_CreateProposal />
      default:
        return <Step1_LoadConfig />
    }
  }

  const handleStartOver = () => {
    reset()
    setShowResetConfirm(false)
    window.location.reload()
  }

  return (
    <Box>
      <Stack gap="x6">
        <MigrationProgressTracker />

        {daoDeployed && (
          <Box p="x4" borderRadius="curved" backgroundColor="accent" color="background1">
            <Flex align="center" justify="space-between" wrap="wrap" gap="x2">
              <Stack gap="x1">
                <Text fontWeight="label" fontSize={14}>
                  DAO Deployed on Target Chain
                </Text>
                <Text fontSize={12} style={{ opacity: 0.85 }}>
                  {targetAddresses?.token}
                </Text>
              </Stack>
              <Box
                as="a"
                href={`/dao/${targetChainSlug}/${targetAddresses?.token}`}
                target="_blank"
                rel="noopener noreferrer"
                p="x2"
                borderRadius="curved"
                backgroundColor="background1"
                color="accent"
                fontSize={14}
                fontWeight="label"
                style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                View New DAO &rarr;
              </Box>
            </Flex>
          </Box>
        )}

        {renderStep()}

        <Box
          pt="x4"
          borderTopStyle="solid"
          borderTopWidth="normal"
          borderTopColor="border"
        >
          {!showResetConfirm ? (
            <Button
              variant="ghost"
              color="negative"
              onClick={() => setShowResetConfirm(true)}
            >
              Start Over
            </Button>
          ) : (
            <Stack gap="x2">
              <Text fontSize={14} color="text3">
                This will reset all migration progress. This cannot be undone.
              </Text>
              <Flex gap="x2">
                <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  backgroundColor="negative"
                  onClick={handleStartOver}
                >
                  Confirm Reset
                </Button>
              </Flex>
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  )
}
