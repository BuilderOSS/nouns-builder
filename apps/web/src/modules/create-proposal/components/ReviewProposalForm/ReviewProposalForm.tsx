import { useVotes } from '@buildeross/hooks/useVotes'
import { governorAbi } from '@buildeross/sdk/contract'
import { AddressType, CHAIN_ID } from '@buildeross/types'
import { TextInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { AnimatedModal, SuccessModalContent } from '@buildeross/ui/Modal'
import { Box, Flex, Icon } from '@buildeross/zord'
import * as Sentry from '@sentry/nextjs'
import axios from 'axios'
import { Field, FieldProps, Formik } from 'formik'
import React, { useState } from 'react'
import { ContractButton } from 'src/components/ContractButton'
import { ErrorResult } from 'src/services/errorResult'
import { SimulationOutput, SimulationResult } from 'src/services/simulationService'
import { useChainStore, useDaoStore } from 'src/stores'
import { toHex } from 'viem'
import { useAccount, useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { BuilderTransaction, useProposalStore } from '../../stores'
import { prepareProposalTransactions } from '../../utils/prepareTransactions'
import { ERROR_CODE, FormValues, validationSchema } from './fields'
import { checkboxHelperText, checkboxStyleVariants } from './ReviewProposalForm.css'
import { Transactions } from './Transactions'

const CHAINS_TO_SIMULATE = [
  CHAIN_ID.ETHEREUM,
  CHAIN_ID.SEPOLIA,
  CHAIN_ID.OPTIMISM,
  CHAIN_ID.OPTIMISM_SEPOLIA,
  CHAIN_ID.BASE,
  CHAIN_ID.BASE_SEPOLIA,
  CHAIN_ID.ZORA,
  CHAIN_ID.ZORA_SEPOLIA,
]

interface ReviewProposalProps {
  disabled: boolean
  title?: string
  summary?: string
  transactions: BuilderTransaction[]
  onProposalCreated: () => Promise<void>
  onEditTransactions?: () => void
}

const logError = async (e: unknown) => {
  console.error(e)
  Sentry.captureException(e)
  await Sentry.flush(2000)
  return
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
  const [skipSimulation, setSkipSimulation] = useState<boolean>(false)

  const { votes, hasThreshold, proposalVotesRequired, isLoading } = useVotes({
    chainId: chain.id,
    collectionAddress: addresses.token,
    governorAddress: addresses.governor,
    signerAddress: address,
  })

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      if (!addresses.governor) {
        return
      }

      setError(undefined)
      setSimulationError(undefined)
      setFailedSimulations([])
      setSkipSimulation(false)

      if (!hasThreshold) {
        setError(ERROR_CODE.NOT_ENOUGH_VOTES)
        return
      }

      const {
        targets,
        values: transactionValues,
        calldata,
      } = prepareProposalTransactions(values.transactions)

      if (!!CHAINS_TO_SIMULATE.find((x) => x === chain.id) && !skipSimulation) {
        let simulationResult

        try {
          setSimulating(true)

          simulationResult = await axios
            .post<SimulationResult>('/api/simulate', {
              treasuryAddress: addresses.treasury,
              chainId: chain.id,
              calldatas: calldata,
              values: transactionValues.map((x) => toHex(x)),
              targets,
            })
            .then((res) => res.data)

          // eslint-disable-next-line no-console
          console.info({ simulationResult })
        } catch (err) {
          if (axios.isAxiosError(err)) {
            const data = err.response?.data as ErrorResult
            setSimulationError(data.error)
            logError(err)
          } else {
            logError(err)
            setSimulationError('Unable to simulate transactions on DAO create form')
          }
          return
        } finally {
          setSimulating(false)
        }
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
      }

      try {
        setProposing(true)
        const params = {
          targets: targets,
          values: transactionValues,
          calldatas: calldata as Array<AddressType>,
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
                    type={'text'}
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
