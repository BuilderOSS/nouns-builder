import { useVotes } from '@buildeross/hooks/useVotes'
import { ProposalDescription } from '@buildeross/proposal-ui'
import { governorAbi, treasuryAbi } from '@buildeross/sdk/contract'
import { type Proposal } from '@buildeross/sdk/subgraph'
import { awaitSubgraphSync } from '@buildeross/sdk/subgraph'
import {
  BuilderTransaction,
  useChainStore,
  useDaoStore,
  useProposalStore,
} from '@buildeross/stores'
import { type SimulationOutput } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { defaultInputLabelStyle } from '@buildeross/ui/styles'
import { getEnsAddress } from '@buildeross/utils/ens'
import { handleGMTOffset, unpackOptionalArray } from '@buildeross/utils/helpers'
import { getProvider } from '@buildeross/utils/provider'
import { Box, Button, Flex, Icon, Stack, Text } from '@buildeross/zord'
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
import { ERROR_CODE, FormValues, validationSchema } from './fields'
import {
  checkboxHelperText,
  checkboxLabel,
  checkboxStyleVariants,
  visuallyHiddenCheckbox,
} from './ReviewProposalForm.css'
import { Transactions } from './Transactions'

interface ReviewProposalProps {
  disabled: boolean
  title?: string
  summary?: string
  representedAddress?: string
  discussionUrl?: string
  representedAddressEnabled: boolean
  transactions: BuilderTransaction[]
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
    clearProposal,
    setTitle,
    setSummary,
    setRepresentedAddress,
    setDiscussionUrl,
    setRepresentedAddressEnabled,
  } = useProposalStore()

  const [error, setError] = useState<string | undefined>()
  const [simulationError, setSimulationError] = useState<string | undefined>()
  const [simulating, setSimulating] = useState<boolean>(false)
  const [failedSimulations, setFailedSimulations] = useState<Array<SimulationOutput>>([])
  const [proposing, setProposing] = useState<boolean>(false)
  const [skipSimulation, setSkipSimulation] = useState<boolean>(SKIP_SIMULATION)
  const [isEditingMetadata, setIsEditingMetadata] = useState<boolean>(false)
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false)

  const { votes, hasThreshold, proposalVotesRequired, isLoading } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: address,
  })

  const { data: governanceConfigData } = useReadContracts({
    allowFailure: false,
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
    ] as const,
  })

  const [votingDelay, votingPeriod, timelockDelay] = unpackOptionalArray(
    governanceConfigData,
    3
  )

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      if (!addresses.governor || !addresses.treasury) {
        return
      }

      setError(undefined)
      setSimulationError(undefined)
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
        const params = {
          targets: targets,
          values: transactionValues,
          calldatas: calldata as Hex[],
          description: JSON.stringify({
            version: 1,
            title: values.title?.trim() || '',
            description: values.summary?.trim() || '',
            ...(values.representedAddressEnabled && values.representedAddress?.trim()
              ? { representedAddress: values.representedAddress.trim() }
              : {}),
            ...(values.discussionUrl?.trim()
              ? { discussionUrl: values.discussionUrl.trim() }
              : {}),
          }),
        }

        const data = await simulateContract(config, {
          abi: governorAbi,
          functionName: 'propose',
          address: addresses.governor,
          chainId: chain.id,
          args: [params.targets, params.values, params.calldatas, params.description],
        })

        const hash = await writeContract(config, data.request)

        const receipt = await waitForTransactionReceipt(config, {
          hash,
          chainId: chain.id,
        })

        await awaitSubgraphSync(chain.id, receipt.blockNumber)

        // Parse logs to find the proposal ID
        let proposalId: string | null = null

        for (const log of receipt.logs) {
          try {
            // Decode the log using the coinFactory ABI
            const decodedLog = decodeEventLog({
              abi: governorAbi,
              data: log.data,
              topics: log.topics,
            })

            // Check if this is the ProposalCreated event
            if (decodedLog.eventName === 'ProposalCreated') {
              // Extract the coin address from the event args
              // The event structure should have the coin address in args
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
    ]
  )

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
        const resolved = await getEnsAddress(rawValue, getProvider(chain.id))
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
        await formik.setFieldError('representedAddress', 'Enter a valid wallet address')
        return false
      }
    },
    [chain.id, setRepresentedAddress]
  )

  if (isLoading) return null

  const tokensNeeded = Number(proposalVotesRequired ?? 0n)
  const nowTimestamp = Math.floor(Date.now() / 1000)
  const hasVotingDelay = votingDelay !== undefined && votingDelay !== null
  const hasVotingPeriod = votingPeriod !== undefined && votingPeriod !== null
  const hasTimelockDelay = timelockDelay !== undefined && timelockDelay !== null

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
        <Formik
          validationSchema={validationSchema}
          initialValues={{
            summary: summary || '',
            title: title || '',
            representedAddress: representedAddress || '',
            discussionUrl: discussionUrl || '',
            representedAddressEnabled,
            transactions,
          }}
          validateOnMount={false}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={onSubmit}
        >
          {(formik) =>
            (() => {
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

              const validateAndSubmit = async () => {
                setHasAttemptedSubmit(true)
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
                    {isEditingMetadata ? (
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
                    ) : (
                      (() => {
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
                          <ProposalDescription
                            title={formik.values.title || ''}
                            proposal={previewProposal}
                            collection={addresses.token || ''}
                            onOpenProposalReview={async () => undefined}
                            isPreview
                          />
                        )
                      })()
                    )}
                  </Stack>

                  <Transactions
                    disabled={disabledForm}
                    transactions={transactions}
                    simulations={failedSimulations}
                    simulationError={simulationError}
                  />

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

                  {(!!simulationError || failedSimulations.length > 0) && (
                    <Flex
                      mt={'x4'}
                      align={'center'}
                      justify={'center'}
                      gap={'x2'}
                      pb={'x4'}
                    >
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
                        I understand the risks and want to submit without simulation.
                      </Flex>
                    </Flex>
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
                    <Box>{'Submit Proposal'}</Box>
                    {!!votes && (
                      <Box
                        position={'absolute'}
                        right={{ '@initial': 'x2', '@768': 'x4' }}
                        px={'x3'}
                        py={'x1'}
                        borderRadius={'normal'}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
                    continueLabel={'Submit Proposal'}
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
          title={'Proposal submitting'}
          subtitle={'Your Proposal is being submitted'}
          pending
        />
      </AnimatedModal>
    </Flex>
  )
}
