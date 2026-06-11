import { Box, Stack } from '@buildeross/zord'
import React from 'react'

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
import { Step6_MintTokens } from './Step6_MintTokens'
import { Step7_SetAttributes } from './Step7_SetAttributes'
import { Step8_CreateProposal } from './Step8_CreateProposal'

/**
 * Cross-Chain Migration Transaction Form
 *
 * 8-step process:
 * 1. Load source DAO config and select target chain
 * 2. Review and edit configuration
 * 3. Deploy DAO on target chain
 * 4. Setup metadata properties
 * 5. Setup merkle roots
 * 6. Mint reserved tokens
 * 7. Set attributes (optional)
 * 8. Create proposal to pause auctions and bridge treasury
 */
export const CrossChainMigration: React.FC = () => {
  const { currentStep } = useCrossChainMigration()

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
      case MigrationStep.MINT_TOKENS:
        return <Step6_MintTokens />
      case MigrationStep.SET_ATTRIBUTES:
        return <Step7_SetAttributes />
      case MigrationStep.CREATE_PROPOSAL:
        return <Step8_CreateProposal />
      default:
        return <Step1_LoadConfig />
    }
  }

  return (
    <Box>
      <Stack gap="x6">
        <MigrationProgressTracker />
        {renderStep()}
      </Stack>
    </Box>
  )
}
