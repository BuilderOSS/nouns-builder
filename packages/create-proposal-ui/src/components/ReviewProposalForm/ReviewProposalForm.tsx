import { useProposalState, useProposalTimeline } from '@buildeross/hooks'
import { useVotes } from '@buildeross/hooks/useVotes'
import {
  normalizeTextForCompare,
  ProposalDescription,
  TRANSACTION_TYPES,
} from '@buildeross/proposal-ui'
import { governorAbi, treasuryAbi } from '@buildeross/sdk/contract'
import { type Proposal } from '@buildeross/sdk/subgraph'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import { useChainStore, useDaoStore, useProposalStore } from '@buildeross/stores'
import {
  ProposalState,
  type SimulationOutput,
  TransactionBundle,
} from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { TextArea } from '@buildeross/ui/Fields'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { defaultInputLabelStyle } from '@buildeross/ui/styles'
import { getEnsAddress } from '@buildeross/utils/ens'
import { handleGMTOffset, unpackOptionalArray } from '@buildeross/utils/helpers'
import {
  buildProposalMetadata,
  generateProposalSalt,
} from '@buildeross/utils/proposalMetadata'
import { Box, Button, Flex, Icon, Stack, Text, vars } from '@buildeross/zord'
import dayjs from 'dayjs'
import { Formik, type FormikProps } from 'formik'
import React, { useState } from 'react'
import { decodeEventLog, getAddress, type Hex, isAddress } from 'viem'
import { useAccount, useConfig, useReadContracts } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { prepareProposalTransactions } from '../../utils/prepareTransactions'
import {
  isSimulationSupported,
  simulateTransactions,
} from '../../utils/tenderlySimulation'
import { MobileProposalActionBar } from '../MobileProposalActionBar'
import { ProposalDraftForm } from '../ProposalDraftForm'
import { UpdateDeadlinePassedModal } from '../UpdateDeadlinePassedModal'
import { createValidationSchema, ERROR_CODE, FormValues } from './fields'
import {
  checkboxHelperText,
  checkboxLabel,
  checkboxStyleVariants,
  visuallyHiddenCheckbox,
} from './ReviewProposalForm.css'

interface ReviewProposalProps {
  disabled: boolean
  title?: string
  summary?: string
  representedAddress?: string
  discussionUrl?: string
  representedAddressEnabled: boolean
  transactions: TransactionBundle[]
  onProposalCreated: (proposalId: string | null) => void
  onBackMobile?: () => void
  onResetMobile?: () => void
}

const SKIP_SIMULATION = process.env.NEXT_PUBLIC_DISABLE_TENDERLY_SIMULATION === 'true'

const logError = async (e: unknown) => {
  console.error(e)
  try {
    const sentry = await import('@sentry/nextjs').catch(() => null)
    if (sentry) {
      sentry.captureException(e)
      sentry.flush(2000).catch(() => {})
    }
  } catch (_) {}
}

const formatTimestamp = (timestamp?: number) => {
  if (timestamp === undefined || timestamp === null) return 'Unavailable'
  return `${dayjs.unix(timestamp).format('MMM D, YYYY h:mm A')} ${handleGMTOffset()}`
}

const dedupeBundleSummary = (
  summary: string | undefined,
  fallback: string | undefined
) => {
  if (!summary) return undefined
  if (!fallback) return summary
  return normalizeTextForCompare(summary) === normalizeTextForCompare(fallback)
    ? undefined
    : summary
}

export const ReviewProposalForm = ({
  disabled: disabledForm,
  title,
  summary,
  representedAddress,
  discussionUrl,
  representedAddressEnabled,
  transactions,
  onProposalCreated,
  onBackMobile,
  onResetMobile,
}: ReviewProposalProps) => {
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()
  const { address } = useAccount()
  const {
    updateProposalId,
    clearProposal,
    setTitle,
    setSummary,
    setRepresentedAddress,
    setDiscussionUrl,
    setRepresentedAddressEnabled,
    setUpdateProposalId,
    proposalSalt,
    setProposalSalt,
  } = useProposalStore()

  const [error, setError] = useState<string | undefined>()
  const [simulationError, setSimulationError] = useState<string | undefined>()
  const [simulating, setSimulating] = useState<boolean>(false)
  const [previewSimulations, setPreviewSimulations] = useState<Array<SimulationOutput>>(
    []
  )
  const [failedSimulations, setFailedSimulations] = useState<Array<SimulationOutput>>([])
  const [proposing, setProposing] = useState<boolean>(false)
  const [submissionStep, setSubmissionStep] = useState<
    'cancelling' | 'submitting' | null
  >(null)
  const [skipSimulation, setSkipSimulation] = useState<boolean>(SKIP_SIMULATION)
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false)
  const [showDeadlineModal, setShowDeadlineModal] = useState<boolean>(false)
  const formikRef = React.useRef<FormikProps<FormValues> | null>(null)
  const effectiveProposalSaltRef = React.useRef<string | undefined>(proposalSalt)

  React.useEffect(() => {
    if (proposalSalt) {
      effectiveProposalSaltRef.current = proposalSalt
      return
    }

    const nextSalt = generateProposalSalt()
    effectiveProposalSaltRef.current = nextSalt
    setProposalSalt(nextSalt)
  }, [proposalSalt, setProposalSalt])

  const { votes, hasThreshold, proposalVotesRequired, isLoading } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: address,
  })

  // Check if proposal is still updatable (only when updating)
  const {
    isUpdatable,
    state: proposalState,
    isLoading: isLoadingState,
  } = useProposalState({
    chainId: chain.id,
    governorAddress: addresses.governor as any,
    proposalId: updateProposalId as any,
  })

  const {
    isInUpdatablePeriod,
    updateDeadline,
    isLoading: isLoadingTimeline,
  } = useProposalTimeline({
    chainId: chain.id,
    governorAddress: addresses.governor as any,
    proposalId: updateProposalId as any,
  })

  const canStillUpdate =
    !updateProposalId ||
    (isUpdatable && isInUpdatablePeriod && !isLoadingState && !isLoadingTimeline)

  // Check if the old proposal can be cancelled
  const canCancelOldProposal =
    !!updateProposalId &&
    proposalState !== undefined &&
    proposalState !== ProposalState.Executed &&
    proposalState !== ProposalState.Canceled &&
    proposalState !== ProposalState.Replaced &&
    proposalState !== ProposalState.Vetoed &&
    proposalState !== ProposalState.Defeated

  const { data: governanceConfigData } = useReadContracts({
    allowFailure: true,
    query: {
      enabled: !!addresses.governor && !!addresses.treasury,
    },
    contracts: [
      {
        abi: governorAbi,
        address: addresses.governor,
        chainId: chain.id,
        functionName: 'votingDelay',
      },
      {
        abi: governorAbi,
        address: addresses.governor,
        chainId: chain.id,
        functionName: 'votingPeriod',
      },
      {
        abi: treasuryAbi,
        address: addresses.treasury,
        chainId: chain.id,
        functionName: 'delay',
      },
      {
        abi: governorAbi,
        address: addresses.governor,
        chainId: chain.id,
        functionName: 'proposalUpdatablePeriod',
      },
    ] as const,
  })

  const [
    votingDelayResult,
    votingPeriodResult,
    timelockDelayResult,
    updatablePeriodResult,
  ] = unpackOptionalArray(governanceConfigData, 4)

  // Extract values from results
  const votingDelay =
    votingDelayResult && 'result' in votingDelayResult
      ? votingDelayResult.result
      : undefined
  const votingPeriod =
    votingPeriodResult && 'result' in votingPeriodResult
      ? votingPeriodResult.result
      : undefined
  const timelockDelay =
    timelockDelayResult && 'result' in timelockDelayResult
      ? timelockDelayResult.result
      : undefined
  // Extract updatable period (will be undefined/error for v2.x Governors)
  const updatablePeriod =
    updatablePeriodResult && 'result' in updatablePeriodResult
      ? updatablePeriodResult.result
      : undefined

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      if (!addresses.governor || !addresses.treasury) {
        return
      }

      setError(undefined)
      setSimulationError(undefined)
      setPreviewSimulations([])
      setFailedSimulations([])

      if (!hasThreshold) {
        setError(ERROR_CODE.NOT_ENOUGH_VOTES)
        return
      }

      const {
        targets,
        values: transactionValues,
        calldata,
      } = prepareProposalTransactions(values.transactions)

      if (isSimulationSupported(chain.id) && !skipSimulation) {
        try {
          setSimulating(true)

          const simulationResult = await simulateTransactions({
            treasuryAddress: addresses.treasury,
            chainId: chain.id,
            calldatas: calldata,
            values: transactionValues,
            targets,
          })

          // eslint-disable-next-line no-console
          console.info({ simulationResult })

          if (simulationResult?.error) {
            logError(simulationResult.error)
            setSimulationError('Error simulating transactions: ' + simulationResult.error)
            return
          }

          setPreviewSimulations(simulationResult?.simulations || [])

          if (simulationResult?.success === false) {
            const failed =
              simulationResult?.simulations.filter(({ status }) => status === false) || []
            setFailedSimulations(failed)
            return
          }
        } catch (err) {
          logError(err)
          setSimulationError(
            err instanceof Error
              ? err.message
              : 'Unable to simulate transactions on DAO create form'
          )
          return
        } finally {
          setSimulating(false)
        }
      }

      try {
        setProposing(true)
        setSubmissionStep('submitting')
        const proposalSaltForSubmission =
          effectiveProposalSaltRef.current || generateProposalSalt()
        effectiveProposalSaltRef.current = proposalSaltForSubmission
        if (proposalSalt !== proposalSaltForSubmission) {
          setProposalSalt(proposalSaltForSubmission)
        }

        const params = {
          targets: targets,
          values: transactionValues,
          calldatas: calldata as Hex[],
          description: buildProposalMetadata({
            title: values.title,
            description: values.summary,
            transactionBundles: values.transactions.map((transaction) => ({
              type: transaction.type,
              summary: dedupeBundleSummary(
                transaction.summary,
                TRANSACTION_TYPES[transaction.type]?.subTitle
              ),
              callCount: transaction.transactions.length,
            })),
            representedAddress: values.representedAddressEnabled
              ? values.representedAddress
              : undefined,
            discussionUrl: values.discussionUrl,
            proposalSalt: proposalSaltForSubmission,
            proposer: address,
          }),
        }

        // Check if we're updating an existing proposal or creating a new one
        const isUpdate = !!updateProposalId

        // If updating, check if the proposal is still updatable
        if (isUpdate && !canStillUpdate) {
          setShowDeadlineModal(true)
          return
        }

        let hash: Hex
        if (isUpdate) {
          const data = await simulateContract(config, {
            abi: governorAbi,
            functionName: 'updateProposal',
            address: addresses.governor,
            chainId: chain.id,
            args: [
              updateProposalId as Hex,
              params.targets,
              params.values,
              params.calldatas,
              params.description,
              values.updateMessage || '', // updateMessage - optional message about what changed
            ],
          })
          hash = await writeContract(config, data.request)
        } else {
          const data = await simulateContract(config, {
            abi: governorAbi,
            functionName: 'propose',
            address: addresses.governor,
            chainId: chain.id,
            args: [params.targets, params.values, params.calldatas, params.description],
          })
          hash = await writeContract(config, data.request)
        }

        const receipt = await waitForTransactionReceipt(config, {
          hash,
          chainId: chain.id,
        })

        await awaitSubgraphSync(chain.id, receipt.blockNumber)

        // Parse logs to find the proposal ID
        let proposalId: string | null = null

        for (const log of receipt.logs) {
          try {
            // Decode the log using the governor ABI
            const decodedLog = decodeEventLog({
              abi: governorAbi,
              data: log.data,
              topics: log.topics,
            })

            // Check if this is the ProposalCreated or ProposalUpdated event
            if (
              decodedLog.eventName === 'ProposalCreated' ||
              decodedLog.eventName === 'ProposalUpdated'
            ) {
              const args = decodedLog.args as any
              if (args.proposalId) {
                proposalId = args.proposalId as string
                break
              }
            }
          } catch (e) {
            // Continue to next log if parsing fails (might be a different event)
            continue
          }
        }

        clearProposal()

        onProposalCreated(proposalId)
      } catch (err: any) {
        if (
          err?.code === 'ACTION_REJECTED' ||
          err?.message?.includes('rejected') ||
          err?.message?.includes('denied')
        ) {
          setError(ERROR_CODE.REJECTED)
          return
        }
        logError(err)
        setError(err.message)
      } finally {
        setProposing(false)
        setSubmissionStep(null)
      }
    },
    [
      addresses,
      hasThreshold,
      clearProposal,
      chain.id,
      config,
      skipSimulation,
      onProposalCreated,
      updateProposalId,
      proposalSalt,
      address,
      setProposalSalt,
      canStillUpdate,
    ]
  )

  // Handle modal actions for when update deadline has passed
  const handleSubmitAsNew = React.useCallback(() => {
    setShowDeadlineModal(false)
    // Clear the updateProposalId so it submits as a new proposal
    setUpdateProposalId(undefined)
    const nextSalt = generateProposalSalt()
    effectiveProposalSaltRef.current = nextSalt
    setProposalSalt(nextSalt)
    // Re-trigger submission
    if (formikRef.current) {
      formikRef.current.submitForm()
    }
  }, [setProposalSalt, setUpdateProposalId])

  const handleSubmitAsNewAndCancel = React.useCallback(async () => {
    setShowDeadlineModal(false)
    if (!updateProposalId || !addresses.governor) return

    try {
      setProposing(true)

      // Only cancel the old proposal if it's cancellable
      if (canCancelOldProposal) {
        setSubmissionStep('cancelling')
        const cancelData = await simulateContract(config, {
          abi: governorAbi,
          functionName: 'cancel',
          address: addresses.governor,
          chainId: chain.id,
          args: [updateProposalId as Hex],
        })
        const cancelHash = await writeContract(config, cancelData.request)

        await waitForTransactionReceipt(config, {
          hash: cancelHash,
          chainId: chain.id,
        })
      }

      // Clear the updateProposalId so the form submits as a new proposal
      setUpdateProposalId(undefined)
      const nextSalt = generateProposalSalt()
      effectiveProposalSaltRef.current = nextSalt
      setProposalSalt(nextSalt)

      // Now submitting the new proposal
      setSubmissionStep('submitting')

      // Trigger submission
      if (formikRef.current) {
        formikRef.current.submitForm()
      }
    } catch (err: any) {
      setProposing(false)
      setSubmissionStep(null)
      if (
        err?.code === 'ACTION_REJECTED' ||
        err?.message?.includes('rejected') ||
        err?.message?.includes('denied')
      ) {
        setError(ERROR_CODE.REJECTED)
        return
      }
      logError(err)
      setError(err.message)
    }
  }, [
    updateProposalId,
    addresses.governor,
    chain.id,
    config,
    canCancelOldProposal,
    setProposalSalt,
    setUpdateProposalId,
  ])

  const handleCloseDeadlineModal = React.useCallback(() => {
    setShowDeadlineModal(false)
    setProposing(false)
  }, [])

  const resolveAndStoreRepresentedAddress = React.useCallback(
    async (formik: FormikProps<FormValues>) => {
      if (!formik.values.representedAddressEnabled) {
        setRepresentedAddress(undefined)
        return true
      }

      const rawValue = (formik.values.representedAddress || '').trim()

      if (!rawValue) {
        setRepresentedAddress(undefined)
        return true
      }

      try {
        const resolved = await getEnsAddress(rawValue)
        const currentValue =
          (
            formik.getFieldMeta('representedAddress').value as string | undefined
          )?.trim() || ''
        if (currentValue !== rawValue) {
          return false
        }
        if (!resolved || !isAddress(resolved, { strict: false })) {
          await formik.setFieldError('representedAddress', 'Enter a valid wallet address')
          return false
        }

        const normalizedAddress = getAddress(resolved)
        if (normalizedAddress !== formik.values.representedAddress) {
          await formik.setFieldValue('representedAddress', normalizedAddress)
        }
        setRepresentedAddress(normalizedAddress)
        return true
      } catch {
        const currentValue =
          (
            formik.getFieldMeta('representedAddress').value as string | undefined
          )?.trim() || ''
        if (currentValue !== rawValue) {
          return false
        }
        await formik.setFieldError('representedAddress', 'Enter a valid wallet address')
        return false
      }
    },
    [setRepresentedAddress]
  )

  if (isLoading) return null

  const tokensNeeded = Number(proposalVotesRequired ?? 0n)
  const nowTimestamp = Math.floor(Date.now() / 1000)
  const hasVotingDelay = votingDelay !== undefined && votingDelay !== null
  const hasVotingPeriod = votingPeriod !== undefined && votingPeriod !== null
  const hasTimelockDelay = timelockDelay !== undefined && timelockDelay !== null
  const hasUpdatablePeriod =
    updatablePeriod !== undefined && updatablePeriod !== null && updatablePeriod > 0n

  const estimatedUpdateDeadline = hasUpdatablePeriod
    ? nowTimestamp + Number(updatablePeriod)
    : undefined
  const estimatedVotingStartsAt = hasVotingDelay
    ? nowTimestamp + Number(votingDelay)
    : undefined
  const estimatedVotingEndsAt =
    hasVotingDelay && hasVotingPeriod
      ? nowTimestamp + Number(votingDelay) + Number(votingPeriod)
      : undefined
  const estimatedEarliestExecutionAt =
    estimatedVotingEndsAt !== undefined && hasTimelockDelay
      ? estimatedVotingEndsAt + Number(timelockDelay)
      : undefined

  return (
    <Flex direction={'column'} width={'100%'} pb={'x24'}>
      <Flex direction={'column'} width={'100%'}>
        <Formik<FormValues>
          validationSchema={createValidationSchema(!!updateProposalId)}
          initialValues={{
            summary: summary || '',
            title: title || '',
            representedAddress: representedAddress || '',
            discussionUrl: discussionUrl || '',
            representedAddressEnabled,
            transactions,
            updateMessage: undefined,
          }}
          validateOnMount={false}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={onSubmit}
        >
          {(formik) =>
            (() => {
              // Store formik ref for use in modal handlers
              formikRef.current = formik

              const flattenErrorMessages = (value: unknown): string[] => {
                if (!value) return []
                if (typeof value === 'string') return [value]
                if (Array.isArray(value)) {
                  return value.flatMap((item) => flattenErrorMessages(item))
                }
                if (typeof value === 'object') {
                  return Object.values(value as Record<string, unknown>).flatMap((item) =>
                    flattenErrorMessages(item)
                  )
                }
                return []
              }

              const validationMessages = flattenErrorMessages(formik.errors)
              const hasSimulationFailures = failedSimulations.length > 0

              const validateAndSubmit = async () => {
                setHasAttemptedSubmit(true)
                const resolved = await resolveAndStoreRepresentedAddress(formik)
                if (!resolved) {
                  formik.setTouched(
                    {
                      representedAddress: true,
                    },
                    true
                  )
                  return
                }
                const errors = await formik.validateForm()

                if (Object.keys(errors).length > 0) {
                  formik.setTouched(
                    {
                      title: true,
                      summary: true,
                      representedAddress: true,
                      discussionUrl: true,
                    },
                    true
                  )
                  setError(undefined)
                  return
                }

                setError(undefined)
                await formik.submitForm()
              }

              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    void validateAndSubmit()
                  }}
                  style={{ width: '100%' }}
                >
                  <Flex
                    justify={'space-between'}
                    align={'center'}
                    className={defaultInputLabelStyle}
                  >
                    <label>Proposal Preview</label>
                    <Button
                      size={'sm'}
                      variant={'secondary'}
                      onClick={() => setIsEditingMetadata((state) => !state)}
                    >
                      <Icon id={isEditingMetadata ? 'check' : 'pencil'} />
                      {isEditingMetadata ? 'Done' : 'Edit'}
                    </Button>
                  </Flex>
                  <Stack
                    gap={'x3'}
                    p={'x4'}
                    mb={'x8'}
                    borderColor={'border'}
                    borderStyle={'solid'}
                    borderWidth={'normal'}
                    borderRadius={'curved'}
                  >
                    {(() => {
                      const { targets, calldata, values } = prepareProposalTransactions(
                        formik.values.transactions
                      )

                      const previewProposal = {
                        proposer: (address ||
                          '0x0000000000000000000000000000000000000000') as `0x${string}`,
                        description: formik.values.summary || '',
                        title: formik.values.title || '',
                        representedAddress: formik.values.representedAddress || null,
                        discussionUrl: formik.values.discussionUrl || null,
                        targets,
                        calldatas: calldata,
                        values: values.map((value) => value.toString()),
                      } as unknown as Proposal

                      return (
                        <>
                          {isEditingMetadata && (
                            <ProposalDraftForm
                              formik={formik}
                              onTitleChange={(value) => {
                                setTitle(value)
                              }}
                              onSummaryChange={(value) => {
                                setSummary(value)
                              }}
                              onRepresentedAddressEnabledChange={(value) => {
                                setRepresentedAddressEnabled(value)
                                if (!value) {
                                  void formik.setFieldValue('representedAddress', '')
                                  setRepresentedAddress(undefined)
                                }
                              }}
                              onRepresentedAddressBlur={async () => {
                                await resolveAndStoreRepresentedAddress(formik)
                              }}
                              onDiscussionUrlChange={(value) => {
                                setDiscussionUrl(value)
                              }}
                              disabled={disabledForm}
                            />
                          )}

                          <ProposalDescription
                            title={formik.values.title || ''}
                            proposal={previewProposal}
                            onOpenProposalReview={async () => undefined}
                            isPreview
                            showMetadataSections={!isEditingMetadata}
                            previewTransactions={formik.values.transactions}
                            previewSimulations={previewSimulations}
                          />
                        </>
                      )
                    })()}
                  </Stack>

                  <label className={defaultInputLabelStyle}>
                    Governance Timeline (estimated)
                  </label>
                  <Stack
                    gap={'x2'}
                    p={'x4'}
                    mb={'x8'}
                    borderColor={'border'}
                    borderStyle={'solid'}
                    borderWidth={'normal'}
                    borderRadius={'curved'}
                  >
                    <Flex justify={'space-between'} align={'center'} mt={'x1'}>
                      <Text color={'text3'}>Submitted:</Text>
                      <Text>{formatTimestamp(nowTimestamp)}</Text>
                    </Flex>
                    {hasUpdatablePeriod && (
                      <Flex justify={'space-between'} align={'center'}>
                        <Text color={'text3'}>Update deadline:</Text>
                        <Text>{formatTimestamp(estimatedUpdateDeadline)}</Text>
                      </Flex>
                    )}
                    <Flex justify={'space-between'} align={'center'}>
                      <Text color={'text3'}>Voting starts: </Text>
                      <Text>{formatTimestamp(estimatedVotingStartsAt)}</Text>
                    </Flex>
                    <Flex justify={'space-between'} align={'center'}>
                      <Text color={'text3'}>Voting ends: </Text>
                      <Text>{formatTimestamp(estimatedVotingEndsAt)}</Text>
                    </Flex>
                    <Flex justify={'space-between'} align={'center'}>
                      <Text color={'text3'}>Earliest execution: </Text>
                      <Text>{formatTimestamp(estimatedEarliestExecutionAt)}</Text>
                    </Flex>
                  </Stack>

                  {(!!simulationError || hasSimulationFailures) && (
                    <Stack mt={'x4'} gap={'x2'} pb={'x4'} w="100%" align="center">
                      <Text color={'warning'} textAlign={'center'}>
                        <Text as="span" fontWeight={'label'}>
                          Warning:
                        </Text>
                        <Text as="span">
                          {' Simulation indicates this proposal may fail to execute.'}
                        </Text>
                      </Text>
                      <Flex align={'center'} justify={'center'} gap={'x2'}>
                        <label className={checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={skipSimulation}
                            onChange={(e) => setSkipSimulation(e.target.checked)}
                            className={visuallyHiddenCheckbox}
                            aria-describedby="skip-simulation-helper"
                          />
                          <Flex
                            align={'center'}
                            justify={'center'}
                            className={
                              checkboxStyleVariants[
                                skipSimulation ? 'confirmed' : 'default'
                              ]
                            }
                          >
                            {skipSimulation && <Icon fill="background1" id="check" />}
                          </Flex>
                        </label>

                        <Flex id="skip-simulation-helper" className={checkboxHelperText}>
                          I understand the risks and want to submit anyway.
                        </Flex>
                      </Flex>
                    </Stack>
                  )}

                  {updateProposalId && (
                    <Box mb={'x6'}>
                      <TextArea
                        id="updateMessage"
                        value={formik.values.updateMessage || ''}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        inputLabel="Update Message"
                        helperText="Explain what changed in this update"
                        placeholder="e.g., Updated transaction amounts based on community feedback"
                        rows={2}
                        minHeight={80}
                        formik={formik}
                        errorMessage={
                          formik.touched.updateMessage && formik.errors.updateMessage
                        }
                      />
                    </Box>
                  )}

                  {hasAttemptedSubmit && validationMessages.length > 0 && (
                    <Stack mb={'x4'} gap={'x1'}>
                      {validationMessages.map((message, index) => (
                        <Text key={`${message}-${index}`} color={'negative'}>
                          - {message}
                        </Text>
                      ))}
                    </Stack>
                  )}

                  <ContractButton
                    chainId={chain.id}
                    mt={'x3'}
                    width={'100%'}
                    borderRadius={'curved'}
                    loading={simulating}
                    disabled={simulating || proposing || formik.isSubmitting}
                    handleClick={validateAndSubmit}
                    h={'x15'}
                    display={{ '@initial': 'none', '@768': 'flex' }}
                  >
                    <Box>
                      {updateProposalId ? 'Submit Updated Proposal' : 'Submit Proposal'}
                    </Box>
                    {!!votes && (
                      <Box
                        position={'absolute'}
                        right={{ '@initial': 'x2', '@768': 'x4' }}
                        px={'x3'}
                        py={'x1'}
                        borderRadius={'normal'}
                        style={{
                          backgroundColor: `color-mix(in srgb, ${vars.color.onAccent} 30%, transparent)`,
                        }}
                      >
                        {Number(votes)} Votes
                      </Box>
                    )}
                  </ContractButton>

                  <MobileProposalActionBar
                    showBack={!!onBackMobile}
                    onBack={onBackMobile}
                    showQueue={false}
                    showReset={!!onResetMobile}
                    onReset={onResetMobile}
                    showContinue
                    onContinue={() => {
                      void validateAndSubmit()
                    }}
                    continueDisabled={simulating || proposing || formik.isSubmitting}
                    continueLoading={simulating}
                    continueLabel={
                      updateProposalId ? 'Submit Updated Proposal' : 'Submit Proposal'
                    }
                  />
                </form>
              )
            })()
          }
        </Formik>
      </Flex>

      <Flex mb={'x12'} mt={'x4'} color="text3" alignSelf={'center'}>
        You must have {tokensNeeded} {tokensNeeded > 1 ? 'votes' : 'vote'} to submit a
        proposal
      </Flex>

      {!!error && (
        <Flex color={'negative'} justify={'center'} width={'100%'} wrap={'wrap'}>
          {error}
        </Flex>
      )}

      <AnimatedModal open={proposing}>
        <SuccessModalContent
          title={
            submissionStep === 'cancelling'
              ? 'Cancelling Old Proposal'
              : 'Proposal submitting'
          }
          subtitle={
            submissionStep === 'cancelling'
              ? 'Cancelling the original proposal...'
              : 'Your Proposal is being submitted'
          }
          pending
        />
      </AnimatedModal>

      <UpdateDeadlinePassedModal
        isOpen={showDeadlineModal}
        onClose={handleCloseDeadlineModal}
        onSubmitAsNew={handleSubmitAsNew}
        onSubmitAsNewAndCancel={handleSubmitAsNewAndCancel}
        updateDeadline={updateDeadline}
        canCancelOldProposal={canCancelOldProposal}
        oldProposalState={proposalState}
      />
    </Flex>
  )
}
