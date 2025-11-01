import { useVotes } from '@buildeross/hooks/useVotes'
import { governorAbi } from '@buildeross/sdk/contract'
import {
  BuilderTransaction,
  useChainStore,
  useDaoStore,
  useProposalStore,
} from '@buildeross/stores'
import { type SimulationOutput } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui/ContractButton'
import { TextInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Box, Flex, Icon } from '@buildeross/zord'
import { Field, FieldProps, Formik } from 'formik'
import React, { useState } from 'react'
import { type Hex } from 'viem'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { prepareProposalTransactions } from '../../utils/prepareTransactions'
import {
  isSimulationSupported,
  simulateTransactions,
} from '../../utils/tenderlySimulation'
import { ERROR_CODE, FormValues, validationSchema } from './fields'
import { checkboxHelperText, checkboxStyleVariants } from './ReviewProposalForm.css'
import { Transactions } from './Transactions'

interface ReviewProposalProps {
  disabled: boolean
  title?: string
  summary?: string
  transactions: BuilderTransaction[]
  onProposalCreated: () => Promise<void>
  onEditTransactions?: () => void
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

export const ReviewProposalForm = ({
  disabled: disabledForm,
  title,
  summary,
  transactions,
  onProposalCreated,
  onEditTransactions,
}: ReviewProposalProps) => {
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()
  const { address } = useAccount()
  const { clearProposal } = useProposalStore()

  const [error, setError] = useState<string | undefined>()
  const [simulationError, setSimulationError] = useState<string | undefined>()
  const [simulating, setSimulating] = useState<boolean>(false)
  const [failedSimulations, setFailedSimulations] = useState<Array<SimulationOutput>>([])
  const [proposing, setProposing] = useState<boolean>(false)
  const [skipSimulation, setSkipSimulation] = useState<boolean>(SKIP_SIMULATION)

  const { votes, hasThreshold, proposalVotesRequired, isLoading } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: address,
  })

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
          description: values.title + '&&' + values.summary,
        }

        const data = await simulateContract(config, {
          abi: governorAbi,
          functionName: 'propose',
          address: addresses.governor,
          chainId: chain.id,
          args: [params.targets, params.values, params.calldatas, params.description],
        })

        const hash = await writeContract(config, data.request)

        await waitForTransactionReceipt(config, { hash, chainId: chain.id })

        onProposalCreated().then(() => clearProposal())
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

  if (isLoading) return null

  const tokensNeeded = Number(proposalVotesRequired ?? 0n)

  return (
    <Flex direction={'column'} width={'100%'} pb={'x24'}>
      <Flex direction={'column'} width={'100%'}>
        <Formik
          validationSchema={validationSchema}
          initialValues={{ summary, title: title || '', transactions }}
          validateOnMount={false}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit} style={{ width: '100%' }}>
              <Transactions
                disabled={disabledForm}
                transactions={transactions}
                simulations={failedSimulations}
                simulationError={simulationError}
                onEditTransactions={onEditTransactions}
              />

              <Field name="title">
                {() => (
                  <TextInput
                    {...formik.getFieldProps('title')}
                    id={'title'}
                    inputLabel={'Proposal Title'}
                    disabled={disabledForm}
                    errorMessage={formik.errors['title']}
                  />
                )}
              </Field>

              <Field name="summary">
                {({ field }: FieldProps) => (
                  <MarkdownEditor
                    value={field.value}
                    onChange={(value: string) => formik?.setFieldValue(field.name, value)}
                    disabled={disabledForm}
                    inputLabel={'Summary'}
                    errorMessage={formik.errors['summary']}
                  />
                )}
              </Field>

              {(!!simulationError || failedSimulations.length > 0) && (
                <Flex mt={'x4'} align={'center'} justify={'center'} gap={'x2'} pb={'x4'}>
                  <Flex
                    align={'center'}
                    justify={'center'}
                    className={
                      checkboxStyleVariants[skipSimulation ? 'confirmed' : 'default']
                    }
                    onClick={() => setSkipSimulation((s) => !s)}
                  >
                    {skipSimulation && <Icon fill="background1" id="check" />}
                  </Flex>

                  <Flex className={checkboxHelperText}>
                    I understand the risks and want to submit without simulation.
                  </Flex>
                </Flex>
              )}

              <ContractButton
                chainId={chain.id}
                mt={'x3'}
                width={'100%'}
                borderRadius={'curved'}
                loading={simulating}
                disabled={simulating || proposing}
                handleClick={formik.handleSubmit}
                h={'x15'}
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
            </form>
          )}
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
