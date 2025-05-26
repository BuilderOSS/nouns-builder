import * as Sentry from '@sentry/nextjs'
import { Box, Flex } from '@zoralabs/zord'
import axios from 'axios'
import { Field, FieldProps, Formik } from 'formik'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { toHex } from 'viem'
import { useAccount, useConfig, useReadContract } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { ContractButton } from 'src/components/ContractButton'
import TextInput from 'src/components/Fields/TextInput'
import { MarkdownEditor } from 'src/components/MarkdownEditor'
import AnimatedModal from 'src/components/Modal/AnimatedModal'
import { SuccessModalContent } from 'src/components/Modal/SuccessModalContent'
import { SUCCESS_MESSAGES } from 'src/constants/messages'
import { governorAbi, tokenAbi } from 'src/data/contract/abis'
import { useDaoStore } from 'src/modules/dao'
import { ErrorResult } from 'src/services/errorResult'
import { SimulationOutput, SimulationResult } from 'src/services/simulationService'
import { useChainStore } from 'src/stores/useChainStore'
import { AddressType, CHAIN_ID } from 'src/typings'

import { BuilderTransaction, useProposalStore } from '../../stores'
import { prepareProposalTransactions } from '../../utils/prepareTransactions'
import { useEscrowFormStore } from '../TransactionForm/Escrow/EscrowUtils'
import { Transactions } from './Transactions'
import { ERROR_CODE, FormValues, validationSchema } from './fields'

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
}: ReviewProposalProps) => {
  const router = useRouter()
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()
  const { address } = useAccount()
  const { clearProposal } = useProposalStore()

  const [error, setError] = useState<string | undefined>()
  const [simulationError, setSimulationError] = useState<string | undefined>()
  const [simulating, setSimulating] = useState<boolean>(false)
  const [simulations, setSimulations] = useState<Array<SimulationOutput>>([])
  const [proposing, setProposing] = useState<boolean>(false)
  const { clear: clearEscrowForm } = useEscrowFormStore()

  const { data: votes, isLoading } = useReadContract({
    address: addresses?.token as AddressType,
    abi: tokenAbi,
    query: {
      enabled: !!address,
    },
    functionName: 'getVotes',
    chainId: chain.id,
    args: [address as AddressType],
  })

  const { data: proposalThreshold, isLoading: thresholdIsLoading } = useReadContract({
    address: addresses?.governor as AddressType,
    chainId: chain.id,
    abi: governorAbi,
    functionName: 'proposalThreshold',
  })

  const onSubmit = React.useCallback(
    async (values: FormValues) => {
      setError(undefined)
      setSimulationError(undefined)
      setSimulations([])

      if (proposalThreshold === undefined) return

      const votesToNumber = votes ? Number(votes) : 0
      const doesNotHaveEnoughVotes = votesToNumber <= Number(proposalThreshold)
      if (doesNotHaveEnoughVotes) {
        setError(ERROR_CODE.NOT_ENOUGH_VOTES)
        return
      }

      const {
        targets,
        values: transactionValues,
        calldata,
      } = prepareProposalTransactions(values.transactions)

      if (!!CHAINS_TO_SIMULATE.find((x) => x === chain.id)) {
        let simulationResult

        try {
          setSimulating(true)

          simulationResult = await axios
            .post<SimulationResult>('/api/simulate', {
              treasuryAddress: addresses?.treasury,
              chainId: chain.id,
              calldatas: calldata,
              values: transactionValues.map((x) => toHex(x)),
              targets,
            })
            .then((res) => res.data)
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
        const simulationFailed = simulationResult?.success === false
        if (simulationFailed) {
          const failed =
            simulationResult?.simulations.filter(({ status }) => status === false) || []
          setSimulations(failed)
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
          address: addresses?.governor!,
          chainId: chain.id,
          args: [params.targets, params.values, params.calldatas, params.description],
        })

        const hash = await writeContract(config, data.request)

        await waitForTransactionReceipt(config, { hash, chainId: chain.id })

        router
          .push({
            pathname: `/dao/[network]/[token]`,
            query: {
              network: router.query?.network,
              token: router.query?.token,
              message: SUCCESS_MESSAGES.PROPOSAL_SUBMISSION_SUCCESS,
            },
          })
          .then(() => {
            setProposing(false)
            clearProposal()
            clearEscrowForm()
          })
      } catch (err: any) {
        setProposing(false)
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
    },
    [
      router,
      addresses,
      proposalThreshold,
      votes,
      clearProposal,
      clearEscrowForm,
      chain.id,
      config,
    ]
  )

  if (isLoading || thresholdIsLoading) return null

  const tokensNeeded =
    proposalThreshold !== undefined ? Number(proposalThreshold) + 1 : undefined

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
                simulations={simulations}
                simulationError={simulationError}
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

              <ContractButton
                mt={'x3'}
                width={'100%'}
                borderRadius={'curved'}
                loading={simulating}
                disabled={simulating || proposing}
                h={'x15'}
                handleClick={() => formik.submitForm()}
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
        You must have {Number(tokensNeeded)}{' '}
        {!!tokensNeeded && tokensNeeded > 1 ? 'votes' : 'vote'} to submit a proposal
      </Flex>

      {!!error && (
        <Flex color={'negative'} justify={'center'} width={'100%'} wrap={'wrap'}>
          {error}
        </Flex>
      )}

      <AnimatedModal
        open={proposing}
        close={() => {
          setProposing(false)
        }}
      >
        <SuccessModalContent
          title={'Proposal submitting'}
          subtitle={'Your Proposal is being submitted'}
          pending
        />
      </AnimatedModal>
    </Flex>
  )
}
