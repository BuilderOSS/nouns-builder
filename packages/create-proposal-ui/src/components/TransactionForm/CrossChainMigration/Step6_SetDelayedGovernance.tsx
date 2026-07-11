import { ETHERSCAN_BASE_URL } from '@buildeross/constants/etherscan'
import { CHAIN_ID } from '@buildeross/types'
import { ContractButton, DaysHoursMinsSecs } from '@buildeross/ui'
import { toSeconds } from '@buildeross/utils/helpers'
import { Box, Button, Flex, Heading, Stack, Text } from '@buildeross/zord'
import { Form, Formik, useFormikContext } from 'formik'
import React from 'react'

import { useCrossChainMigration } from '../../../hooks/useCrossChainMigration'
import { useUpdateDelayedGovernance } from '../../../hooks/useUpdateDelayedGovernance'

interface DelayedGovernanceForm {
  duration: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

interface FormContentProps {
  isComplete: boolean
  isUpdating: boolean
  isConfirming: boolean
  txHash?: `0x${string}`
  cachedTxHash?: `0x${string}`
  targetChainId?: CHAIN_ID
  updateDelayedGovernance: (timestamp: bigint) => Promise<`0x${string}` | undefined>
  setDelayedGovernanceDuration: (duration: DelayedGovernanceForm['duration']) => void
  setDelayedGovernanceTimestamp: (timestamp: bigint) => void
  setDelayedGovernanceTxHash: (hash: `0x${string}`) => void
  goToPreviousStep: () => void
  handleContinue: () => void
}

const FormContent: React.FC<FormContentProps> = ({
  isComplete,
  isUpdating,
  isConfirming,
  txHash,
  cachedTxHash,
  targetChainId,
  updateDelayedGovernance,
  setDelayedGovernanceDuration,
  setDelayedGovernanceTimestamp,
  setDelayedGovernanceTxHash,
  goToPreviousStep,
  handleContinue,
}) => {
  const formik = useFormikContext<DelayedGovernanceForm>()

  // Sync Formik values to Zustand store
  React.useEffect(() => {
    setDelayedGovernanceDuration(formik.values.duration)
  }, [formik.values.duration, setDelayedGovernanceDuration])

  const handleUpdate = async () => {
    const durationInSeconds = toSeconds(formik.values.duration)
    const currentTimestamp = Math.floor(Date.now() / 1000)
    const delayedTimestamp = BigInt(currentTimestamp + durationInSeconds)

    const hash = await updateDelayedGovernance(delayedTimestamp)
    if (hash) {
      setDelayedGovernanceTimestamp(delayedTimestamp)
      setDelayedGovernanceTxHash(hash)
    }
  }

  return (
    <Form>
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
            When using reserved token minting (like MerkleReserveMinter), you need to set
            a delayed governance expiration timestamp. This prevents governance from
            activating until all reserved tokens are minted.
          </Text>
          <Text fontSize={14} color="text3">
            After this timestamp passes, the DAO governance will become fully active and
            the founder can no longer mint reserved tokens.
          </Text>
        </Box>

        {!isComplete && (
          <>
            <DaysHoursMinsSecs
              {...formik.getFieldProps('duration')}
              inputLabel="Delay Duration (from now)"
              formik={formik}
              id="duration"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.duration}
              placeholder={['1', '0', '0', '0']}
              helperText={`Total: ${toSeconds(formik.values.duration)} seconds (${new Date(Date.now() + toSeconds(formik.values.duration) * 1000).toLocaleString()})`}
            />

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
              href={`${ETHERSCAN_BASE_URL[targetChainId!]}/tx/${txHash || cachedTxHash}`}
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
                Delayed governance expiration has been configured on the Governor
                contract.
              </Text>
            </Box>

            <Flex justify="flex-end">
              <Button onClick={handleContinue}>Continue to Set Attributes</Button>
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
    </Form>
  )
}

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

  const { updateDelayedGovernance, txHash, isUpdating, isConfirming, isSuccess, error } =
    useUpdateDelayedGovernance(targetAddresses?.governor, targetChainId)

  // Derive completion status from local success or persisted txHash (survives refresh)
  const isComplete = isSuccess || !!cachedTxHash

  const handleContinue = () => {
    goToNextStep()
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
        </Flex>
      </Stack>
    )
  }

  return (
    <Formik<DelayedGovernanceForm>
      initialValues={{
        duration: {
          days: cachedDuration?.days ?? 1,
          hours: cachedDuration?.hours ?? 0,
          minutes: cachedDuration?.minutes ?? 0,
          seconds: cachedDuration?.seconds ?? 0,
        },
      }}
      onSubmit={() => {}}
      enableReinitialize={true}
    >
      <FormContent
        isComplete={isComplete}
        isUpdating={isUpdating}
        isConfirming={isConfirming}
        txHash={txHash}
        cachedTxHash={cachedTxHash}
        targetChainId={targetChainId}
        updateDelayedGovernance={updateDelayedGovernance}
        setDelayedGovernanceDuration={setDelayedGovernanceDuration}
        setDelayedGovernanceTimestamp={setDelayedGovernanceTimestamp}
        setDelayedGovernanceTxHash={setDelayedGovernanceTxHash}
        goToPreviousStep={goToPreviousStep}
        handleContinue={handleContinue}
      />
    </Formik>
  )
}
