import { Flex, Icon, Stack, Text } from '@buildeross/zord'
import React from 'react'

import {
  checkboxHelperText,
  checkboxLabel,
  checkboxStyleVariants,
  visuallyHiddenCheckbox,
} from './ReviewProposalForm.css'

export interface SimulationSummaryProps {
  // set when the simulation could not run at all
  simulationError?: string
  failedCount: number
  notSimulatedCount: number
  skipSimulation: boolean
  onSkipSimulationChange: (skipSimulation: boolean) => void
}

const pluralizeCalls = (count: number) => `${count} ${count === 1 ? 'call' : 'calls'}`

export const SimulationSummary: React.FC<SimulationSummaryProps> = ({
  simulationError,
  failedCount,
  notSimulatedCount,
  skipSimulation,
  onSkipSimulationChange,
}) => {
  if (!simulationError && failedCount === 0 && notSimulatedCount === 0) return null

  const callCounts = [
    failedCount > 0 && `${pluralizeCalls(failedCount)} failed simulation`,
    notSimulatedCount > 0 && `${pluralizeCalls(notSimulatedCount)} not simulated`,
  ].filter(Boolean)

  return (
    <Stack mt={'x4'} gap={'x2'} pb={'x4'} w="100%" align="center">
      <Text color={'warning'} textAlign={'center'}>
        <Text as="span" fontWeight={'label'}>
          Warning:
        </Text>
        <Text as="span">
          {' Simulation indicates this proposal may fail to execute.'}
        </Text>
      </Text>
      {!!simulationError && (
        <Text color={'warning'} textAlign={'center'} style={{ overflowWrap: 'anywhere' }}>
          Simulation could not run: {simulationError}
        </Text>
      )}
      {callCounts.length > 0 && (
        <Text color={'warning'} textAlign={'center'}>
          {`${callCounts.join(', ')}. See the highlighted transactions above for details.`}
        </Text>
      )}
      <Flex align={'center'} justify={'center'} gap={'x2'}>
        <label className={checkboxLabel}>
          <input
            type="checkbox"
            checked={skipSimulation}
            onChange={(e) => onSkipSimulationChange(e.target.checked)}
            className={visuallyHiddenCheckbox}
            aria-describedby="skip-simulation-helper"
          />
          <Flex
            align={'center'}
            justify={'center'}
            className={checkboxStyleVariants[skipSimulation ? 'confirmed' : 'default']}
          >
            {skipSimulation && <Icon fill="background1" id="check" />}
          </Flex>
        </label>

        <Flex id="skip-simulation-helper" className={checkboxHelperText}>
          I understand the risks and want to submit anyway.
        </Flex>
      </Flex>
    </Stack>
  )
}
