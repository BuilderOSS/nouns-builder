import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { ContractButton } from '@buildeross/ui'
import { toSeconds } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Heading, Label, Stack, Text } from '@buildeross/zord'
import { useEffect, useState } from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useUpdateDelayedGovernance } from '../../../hooks/useUpdateDelayedGovernance'

export const Step6_SetDelayedGovernance: React.FC = () => {
  const {
    targetChainId,
    targetAddresses,
    delayedGovernanceDuration: cachedDuration,
    delayedGovernanceTxHash: cachedTxHash,
    setDelayedGovernanceDuration,
    setDelayedGovernanceTimestamp,
    setDelayedGovernanceTxHash,
    goToNextStep,
    goToPreviousStep,
  } = useCrossChainMigration()

  // Duration state (Days, Hours, Minutes, Seconds)
  const [duration, setDuration] = useState({
    days: cachedDuration?.days ?? 1,
    hours: cachedDuration?.hours ?? 0,
    minutes: cachedDuration?.minutes ?? 0,
    seconds: cachedDuration?.seconds ?? 0,
  })

  const { updateDelayedGovernance, txHash, isUpdating, isConfirming, isSuccess, error } =
    useUpdateDelayedGovernance(targetAddresses?.governor, targetChainId)

  // Derive completion status from local success or persisted txHash (survives refresh)
  const isComplete = isSuccess || !!cachedTxHash

  // Save duration to Zustand whenever it changes
  useEffect(() => {
    setDelayedGovernanceDuration(duration)
  }, [duration, setDelayedGovernanceDuration])

  const handleUpdate = async () => {
    try {
      // Calculate timestamp: current time + duration in seconds
      const durationInSeconds = toSeconds(duration)
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const delayedTimestamp = BigInt(currentTimestamp + durationInSeconds)

      const hash = await updateDelayedGovernance(delayedTimestamp)

      // Save to context
      setDelayedGovernanceTimestamp(delayedTimestamp)
      setDelayedGovernanceTxHash(hash)
    } catch (err) {
      console.error('Error updating delayed governance:', err)
    }
  }

  const handleContinue = () => {
    goToNextStep()
  }

  const handleDurationChange = (
    field: 'days' | 'hours' | 'minutes' | 'seconds',
    value: string
  ) => {
    const numValue = parseInt(value) || 0
    setDuration((prev) => ({ ...prev, [field]: numValue }))
  }

  if (error) {
    return (
      <Stack gap="x4">
        <Heading size="md">Error Setting Delayed Governance</Heading>
        <Text color="negative">{error}</Text>
        <Flex justify="space-between">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
          <Button onClick={handleUpdate}>Retry</Button>
        </Flex>
      </Stack>
    )
  }

  return (
    <Stack gap="x6">
      <Box>
        <Heading size="md" mb="x2">
          Step 6: Set Delayed Governance
        </Heading>
        <Text color="text3">
          Delayed governance allows reserved token minting before full DAO governance
          activates. This must be set before any tokens are minted.
        </Text>
      </Box>

      <Box p="x4" borderRadius="curved" backgroundColor="background2">
        <Heading size="xs" mb="x3">
          What is Delayed Governance?
        </Heading>
        <Text fontSize={14} color="text3" mb="x3">
          When using reserved token minting (like MerkleReserveMinter), you need to set a
          delayed governance expiration timestamp. This prevents governance from
          activating until all reserved tokens are minted.
        </Text>
        <Text fontSize={14} color="text3">
          After this timestamp passes, the DAO governance will become fully active and the
          founder can no longer mint reserved tokens.
        </Text>
      </Box>

      {!isComplete && (
        <>
          <Box>
            <Label mb="x3">Delay Duration (from now)</Label>
            <Flex gap="x3">
              <Box style={{ flex: 1 }}>
                <Label htmlFor="days" fontSize={12} mb="x1">
                  Days
                </Label>
                <Box
                  as="input"
                  id="days"
                  type="number"
                  min="0"
                  value={duration.days}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDurationChange('days', e.target.value)
                  }
                  p="x3"
                  borderRadius="curved"
                  borderWidth="thin"
                  borderStyle="solid"
                  borderColor="border"
                  backgroundColor="background1"
                  color="text1"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <Label htmlFor="hours" fontSize={12} mb="x1">
                  Hours
                </Label>
                <Box
                  as="input"
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={duration.hours}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDurationChange('hours', e.target.value)
                  }
                  p="x3"
                  borderRadius="curved"
                  borderWidth="thin"
                  borderStyle="solid"
                  borderColor="border"
                  backgroundColor="background1"
                  color="text1"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <Label htmlFor="minutes" fontSize={12} mb="x1">
                  Minutes
                </Label>
                <Box
                  as="input"
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={duration.minutes}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDurationChange('minutes', e.target.value)
                  }
                  p="x3"
                  borderRadius="curved"
                  borderWidth="thin"
                  borderStyle="solid"
                  borderColor="border"
                  backgroundColor="background1"
                  color="text1"
                  style={{ width: '100%' }}
                />
              </Box>
              <Box style={{ flex: 1 }}>
                <Label htmlFor="seconds" fontSize={12} mb="x1">
                  Seconds
                </Label>
                <Box
                  as="input"
                  id="seconds"
                  type="number"
                  min="0"
                  max="59"
                  value={duration.seconds}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleDurationChange('seconds', e.target.value)
                  }
                  p="x3"
                  borderRadius="curved"
                  borderWidth="thin"
                  borderStyle="solid"
                  borderColor="border"
                  backgroundColor="background1"
                  color="text1"
                  style={{ width: '100%' }}
                />
              </Box>
            </Flex>
            <Text color="text4" fontSize={12} mt="x2">
              Total: {toSeconds(duration)} seconds (
              {new Date(Date.now() + toSeconds(duration) * 1000).toLocaleString()})
            </Text>
          </Box>

          <Flex justify="center">
            <ContractButton
              chainId={targetChainId!}
              handleClick={handleUpdate}
              disabled={isUpdating || isConfirming}
              loading={isUpdating || isConfirming}
            >
              {isUpdating
                ? 'Updating...'
                : isConfirming
                  ? 'Confirming...'
                  : 'Set Delayed Governance'}
            </ContractButton>
          </Flex>
        </>
      )}

      {(txHash || cachedTxHash) && targetChainId && (
        <Box p="x4" borderRadius="curved" backgroundColor="background2">
          <Text fontSize={14} color="text3" mb="x2">
            Transaction Hash:
          </Text>
          <Text
            as="a"
            href={`${ETHERSCAN_BASE_URL[targetChainId]}/tx/${txHash || cachedTxHash}`}
            target="_blank"
            rel="noopener noreferrer"
            fontFamily="mono"
            fontSize={12}
            color="accent"
            style={{
              wordBreak: 'break-all',
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            {txHash || cachedTxHash}
          </Text>
        </Box>
      )}

      {isComplete && (
        <>
          <Box p="x4" borderRadius="curved" backgroundColor="positive">
            <Heading size="xs" mb="x2" color="onPositive">
              ✓ Delayed Governance Set Successfully!
            </Heading>
            <Text fontSize={14} color="onPositive">
              Delayed governance expiration has been configured on the Governor contract.
            </Text>
          </Box>

          <Flex justify="flex-end">
            <Button onClick={handleContinue}>Continue to Token Minting</Button>
          </Flex>
        </>
      )}

      {!isComplete && (
        <Flex justify="flex-start">
          <Button variant="secondary" onClick={goToPreviousStep}>
            Back
          </Button>
        </Flex>
      )}
    </Stack>
  )
}
