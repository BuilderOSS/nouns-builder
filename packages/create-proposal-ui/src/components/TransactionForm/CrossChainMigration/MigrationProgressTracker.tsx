import { Box, Flex, Heading, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  DeploymentStep,
  useCrossChainMigration,
} from '../../../hooks/useCrossChainMigration'

const STEP_LABELS = {
  [DeploymentStep.LOAD_CONFIG]: 'Load Config',
  [DeploymentStep.REVIEW_CONFIG]: 'Review',
  [DeploymentStep.DEPLOY_DAO]: 'Deploy',
  [DeploymentStep.SETUP_METADATA]: 'Metadata',
  [DeploymentStep.SETUP_MERKLE_ROOTS]: 'Merkle Roots',
  [DeploymentStep.MINT_TOKENS]: 'Mint Tokens',
  [DeploymentStep.SET_ATTRIBUTES]: 'Attributes',
  [DeploymentStep.CREATE_PROPOSAL]: 'Proposal',
}

export const MigrationProgressTracker: React.FC = () => {
  const { currentStep, setStep } = useCrossChainMigration()

  const progress = ((currentStep + 1) / 8) * 100

  return (
    <Box mb="x6">
      <Heading size="xs" mb="x3">
        Migration Progress
      </Heading>

      <Stack gap="x2" mb="x4">
        <Flex gap="x2">
          {Object.entries(STEP_LABELS).map(([step, label]) => {
            const stepNum = Number(step)
            const isComplete = stepNum < currentStep
            const isCurrent = stepNum === currentStep

            return (
              <Box
                key={step}
                p="x2"
                borderRadius="curved"
                backgroundColor={
                  isComplete ? 'positive' : isCurrent ? 'accent' : 'background2'
                }
                style={{ flex: 1, cursor: isComplete ? 'pointer' : 'default' }}
                onClick={() => isComplete && setStep(stepNum)}
              >
                <Text
                  fontSize={12}
                  color={isComplete || isCurrent ? 'background1' : 'text3'}
                  textAlign="center"
                >
                  {isComplete ? '✓' : stepNum + 1}. {label}
                </Text>
              </Box>
            )
          })}
        </Flex>

        <Box
          w="100%"
          h="x2"
          borderRadius="curved"
          backgroundColor="background2"
          style={{ overflow: 'hidden' }}
        >
          <Box
            h="100%"
            backgroundColor="accent"
            style={{ width: `${progress}%`, transition: 'width 0.3s' }}
          />
        </Box>
      </Stack>

      <Text color="text3" fontSize={14}>
        Step {currentStep + 1} of 8: {STEP_LABELS[currentStep]}
      </Text>
    </Box>
  )
}
