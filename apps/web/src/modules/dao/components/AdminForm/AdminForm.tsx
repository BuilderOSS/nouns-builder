import { NULL_ADDRESS } from '@buildeross/constants/addresses'
import { auctionAbi, governorAbi, metadataAbi, tokenAbi } from '@buildeross/sdk/contract'
import { AddressType } from '@buildeross/types'
import { getEnsAddress } from '@buildeross/utils/ens'
import {
  compareAndReturn,
  fromSeconds,
  unpackOptionalArray,
} from '@buildeross/utils/helpers'
import { Flex, Stack, Text } from '@buildeross/zord'
import { Field, FieldArray, FieldProps, Formik, FormikValues } from 'formik'
import { AnimatePresence, motion } from 'framer-motion'
import isEqual from 'lodash/isEqual'
import { useRouter } from 'next/router'
import React, { BaseSyntheticEvent } from 'react'
import DaysHoursMinsSecs from 'src/components/Fields/DaysHoursMinsSecs'
import Radio from 'src/components/Fields/Radio'
import SmartInput from 'src/components/Fields/SmartInput'
import StickySave from 'src/components/Fields/StickySave'
import { NUMBER, TEXT } from 'src/components/Fields/types'
import { MarkdownEditor } from 'src/components/MarkdownEditor'
import SingleImageUpload from 'src/components/SingleImageUpload/SingleImageUpload'
import { TokenAllocation } from 'src/modules/create-dao'
import {
  BuilderTransaction,
  TransactionType,
  useProposalStore,
} from 'src/modules/create-proposal'
import { useChainStore } from 'src/stores/useChainStore'
import { useDaoStore } from 'src/stores/useDaoStore'
import { Address, encodeFunctionData, formatEther } from 'viem'
import { useReadContracts } from 'wagmi'

import { AdminFormValues, adminValidationSchema } from './AdminForm.schema'
import { AdminFounderAllocationFields } from './AdminFounderAllocationFields'
import { Section } from './Section'
import { formValuesToTransactionMap } from './utils'

interface AdminFormProps {
  collectionAddress: string
}

const vetoerAnimation = {
  init: {
    height: 0,
    overflow: 'hidden',
  },
  open: {
    height: 'auto',
  },
}

export const AdminForm: React.FC<AdminFormProps> = ({ collectionAddress }) => {
  const { push } = useRouter()

  const createProposal = useProposalStore((state) => state.createProposal)
  const addresses = useDaoStore((state) => state.addresses)
  const chain = useChainStore((x) => x.chain)

  const auctionContractParams = {
    abi: auctionAbi,
    address: addresses.auction as Address,
  }

  const governorContractParams = {
    abi: governorAbi,
    address: addresses?.governor as Address,
  }

  const metadataContractParams = {
    abi: metadataAbi,
    address: addresses?.metadata as Address,
  }

  const tokenContractParams = {
    abi: tokenAbi,
    address: addresses?.token as Address,
  }

  const { data } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...auctionContractParams, chainId: chain.id, functionName: 'duration' },
      { ...auctionContractParams, chainId: chain.id, functionName: 'reservePrice' },
      { ...governorContractParams, chainId: chain.id, functionName: 'vetoer' },
      { ...governorContractParams, chainId: chain.id, functionName: 'votingPeriod' },
      { ...governorContractParams, chainId: chain.id, functionName: 'votingDelay' },
      {
        ...governorContractParams,
        chainId: chain.id,
        functionName: 'quorumThresholdBps',
      },
      {
        ...governorContractParams,
        chainId: chain.id,
        functionName: 'proposalThresholdBps',
      },
      { ...metadataContractParams, chainId: chain.id, functionName: 'contractImage' },
      { ...metadataContractParams, chainId: chain.id, functionName: 'projectURI' },
      { ...metadataContractParams, chainId: chain.id, functionName: 'rendererBase' },
      { ...metadataContractParams, chainId: chain.id, functionName: 'description' },
      { ...tokenContractParams, chainId: chain.id, functionName: 'getFounders' },
    ] as const,
  })

  const [
    auctionDuration,
    auctionReservePrice,
    vetoer,
    votingPeriod,
    votingDelay,
    quorumVotesBps,
    proposalThresholdBps,
    daoImage,
    daoWebsite,
    rendererBase,
    description,
    founders,
  ] = unpackOptionalArray(data, 12)

  const initialValues: AdminFormValues = {
    /* artwork */
    projectDescription: description?.replace(/\\n/g, String.fromCharCode(13, 10)) || '',
    // artwork: []

    /* metadata */
    daoAvatar: daoImage || '',
    rendererBase: rendererBase || '',
    daoWebsite: daoWebsite || '',

    /* governor */
    proposalThreshold: Number(proposalThresholdBps) / 100 || 0,
    quorumThreshold: Number(quorumVotesBps) / 100 || 0,
    votingPeriod: fromSeconds(votingPeriod && BigInt(votingPeriod)),
    votingDelay: fromSeconds(votingDelay && BigInt(votingDelay)),
    founderAllocation:
      founders?.map((x) => ({
        founderAddress: x.wallet,
        allocationPercentage: x.ownershipPct,
        endDate: new Date(x.vestExpiry * 1000).toISOString(),
      })) || [],
    vetoPower: !!vetoer && vetoer !== NULL_ADDRESS,
    vetoer: vetoer || '',

    /* auction */
    auctionDuration: fromSeconds(auctionDuration && Number(auctionDuration)),
    auctionReservePrice: auctionReservePrice
      ? parseFloat(formatEther(auctionReservePrice))
      : 0,
  }

  const withPauseUnpause = (
    transactions: BuilderTransaction[],
    auctionAddress: Address
  ) => {
    const targetAddresses = transactions
      .flatMap((txn) => txn.transactions)
      .map((txn) => txn.target)

    if (!targetAddresses.includes(auctionAddress)) {
      return transactions
    }

    const pause = {
      type: TransactionType.CUSTOM,
      transactions: [
        {
          functionSignature: 'pause()',
          target: auctionAddress,
          calldata: encodeFunctionData({
            abi: auctionAbi,
            functionName: 'pause',
          }),
          value: '',
        },
      ],
    }

    const unpause = {
      type: TransactionType.CUSTOM,
      transactions: [
        {
          functionSignature: 'unpause()',
          target: auctionAddress,
          calldata:
            encodeFunctionData({
              abi: auctionAbi,
              functionName: 'unpause',
            }) || '',
          value: '',
        },
      ],
    }

    return [pause, ...transactions, unpause]
  }

  const handleUpdateSettings = async (
    values: AdminFormValues,
    formik: FormikValues | undefined
  ) => {
    let transactions: BuilderTransaction[] = []

    let field: keyof AdminFormValues

    for (field in values) {
      let value = values[field]

      if (isEqual(value, initialValues[field])) {
        continue
      }

      if (field === 'vetoer') {
        value = await getEnsAddress(value as string)
      }

      if (field === 'founderAllocation') {
        // @ts-ignore
        value = await Promise.all(
          (value as TokenAllocation[]).map(
            async ({ founderAddress, allocationPercentage, endDate }) => ({
              founderAddress: (await getEnsAddress(founderAddress)) as AddressType,
              allocationPercentage: allocationPercentage
                ? BigInt(allocationPercentage)
                : 0n,
              endDate: BigInt(Math.floor(new Date(endDate).getTime() / 1000)),
            })
          )
        )
      }

      const transactionProperties = formValuesToTransactionMap[field]
      // @ts-ignore
      const calldata = transactionProperties.constructCalldata(value)
      const target = transactionProperties.getTarget(addresses)

      if (target)
        transactions.push({
          type: TransactionType.CUSTOM,
          transactions: [
            {
              functionSignature: transactionProperties.functionSignature,
              target,
              calldata: calldata || '',
              value: '',
            },
          ],
        })

      // removes burnVetoer from the list of transactions if updateVetoer is present
      if (field === 'vetoer') {
        transactions = transactions.filter(
          (tx: BuilderTransaction) =>
            tx.transactions[0].functionSignature !== 'burnVetoer'
        )
      }
      if (field === 'vetoPower') {
        transactions = transactions.filter(
          (tx: BuilderTransaction) =>
            tx.transactions[0].functionSignature !== 'updateVetoer'
        )
      }
    }

    formik?.setSubmitting(true)

    const transactionsWithPauseUnpause = withPauseUnpause(
      transactions,
      addresses?.auction as Address
    )

    createProposal({
      disabled: false,
      title: undefined,
      summary: undefined,
      transactions: transactionsWithPauseUnpause,
    })

    push(`/dao/${chain.slug}/${collectionAddress}/proposal/review`)
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={adminValidationSchema()}
      onSubmit={(values, formik: FormikValues) => handleUpdateSettings(values, formik)}
      enableReinitialize
      validateOnMount
    >
      {(formik) => {
        const founderChanges = isEqual(
          formik.initialValues.founderAllocation,
          formik.values.founderAllocation
        )
          ? 0
          : 1
        const changes =
          compareAndReturn(formik.initialValues, formik.values).length + founderChanges

        return (
          <Flex direction={'column'} w={'100%'}>
            <Stack>
              <Text variant="heading-sm">Admin</Text>
              <Text color="text3" mt="x2">
                Editing DAO settings will create a proposal.
              </Text>

              <Section title="General Settings">
                <SingleImageUpload
                  {...formik.getFieldProps('daoAvatar')}
                  formik={formik}
                  id={'daoAvatar'}
                  inputLabel={'Dao avatar'}
                  helperText={'Upload'}
                />

                <Field name="projectDescription">
                  {({ field }: FieldProps) => (
                    <MarkdownEditor
                      value={field.value}
                      onChange={(value: string) =>
                        formik?.setFieldValue(field.name, value)
                      }
                      inputLabel={'DAO Description'}
                      errorMessage={formik.errors['projectDescription']}
                    />
                  )}
                </Field>

                <SmartInput
                  {...formik.getFieldProps('daoWebsite')}
                  inputLabel={'Dao Website'}
                  type={TEXT}
                  formik={formik}
                  id={'daoWebsite'}
                  onChange={({ target }: BaseSyntheticEvent) => {
                    formik.setFieldValue('daoWebsite', target.value)
                  }}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['daoWebsite']}
                  placeholder={'https://www.nouns.wtf'}
                />

                <SmartInput
                  {...formik.getFieldProps('rendererBase')}
                  inputLabel={'Renderer Base Url'}
                  type={TEXT}
                  formik={formik}
                  id={'rendererBase'}
                  onChange={({ target }: BaseSyntheticEvent) => {
                    formik.setFieldValue('rendererBase', target.value)
                  }}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['rendererBase']}
                  helperText={
                    'This is the base url of the image stacker used to stack the layers and compose an nft.'
                  }
                />
              </Section>

              <Section title="Auction Settings">
                <DaysHoursMinsSecs
                  {...formik.getFieldProps('auctionDuration')}
                  inputLabel={'Auction Duration'}
                  formik={formik}
                  id={'auctionDuration'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['auctionDuration']}
                  placeholder={['1', '0', '0', '0']}
                />

                <SmartInput
                  {...formik.getFieldProps('auctionReservePrice')}
                  inputLabel={'Auction Reserve Price'}
                  type={NUMBER}
                  formik={formik}
                  id={'auctionReservePrice'}
                  onChange={({ target }: BaseSyntheticEvent) => {
                    formik.setFieldValue('auctionReservePrice', parseFloat(target.value))
                  }}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['auctionReservePrice']}
                  perma={'ETH'}
                />
              </Section>

              <Section title="Governance Settings">
                <SmartInput
                  {...formik.getFieldProps('proposalThreshold')}
                  inputLabel={'Proposal Threshold'}
                  type={NUMBER}
                  formik={formik}
                  id={'proposalThreshold'}
                  onChange={({ target }: BaseSyntheticEvent) => {
                    formik.setFieldValue('proposalThreshold', parseFloat(target.value))
                  }}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['proposalThreshold']}
                  perma={'%'}
                  step={0.1}
                  helperText={
                    'This is the percentage of all existing tokens that must be owned by someone attempting to create a proposal. We recommend a starting value of 0.5% to encourage participation.'
                  }
                />

                <SmartInput
                  {...formik.getFieldProps('quorumThreshold')}
                  inputLabel={'Quorum Threshold'}
                  type={NUMBER}
                  formik={formik}
                  id={'quorumThreshold'}
                  onChange={({ target }: BaseSyntheticEvent) => {
                    formik.setFieldValue('quorumThreshold', parseFloat(target.value))
                  }}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['quorumThreshold']}
                  perma={'%'}
                  step={1}
                  helperText={
                    'This is the percentage of all existing tokens that must vote in a proposal in order for it to pass (as long as a majority of votes approve). We recommend a starting value of 10%.'
                  }
                />

                <DaysHoursMinsSecs
                  {...formik.getFieldProps('votingPeriod')}
                  inputLabel={'Voting Period'}
                  formik={formik}
                  id={'votingPeriod'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['votingPeriod']}
                />

                <DaysHoursMinsSecs
                  {...formik.getFieldProps('votingDelay')}
                  inputLabel={'Voting Delay'}
                  formik={formik}
                  id={'votingDelay'}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  errorMessage={formik.errors['votingDelay']}
                />
              </Section>

              <Section title="Veto Settings">
                <Radio
                  {...formik.getFieldProps('vetoPower')}
                  formik={formik}
                  inputLabel={'Veto Power'}
                  id={'vetoPower'}
                  options={[
                    { value: true, label: 'Yes' },
                    { value: false, label: 'No' },
                  ]}
                  flexDirection={'row'}
                />

                {formik.values['vetoPower'] === true && (
                  <AnimatePresence>
                    <motion.div
                      initial={'init'}
                      animate={'open'}
                      exit={'init'}
                      variants={vetoerAnimation}
                      transition={{ duration: 0.2 }}
                    >
                      <SmartInput
                        {...formik.getFieldProps('vetoer')}
                        inputLabel="Vetoer"
                        type={TEXT}
                        id="vetoer"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        errorMessage={formik.errors['vetoer']}
                        isAddress={true}
                        helperText={
                          'This is the address that has veto power over any proposal.'
                        }
                      />
                    </motion.div>
                  </AnimatePresence>
                )}
              </Section>

              <Section title="Allocation Settings">
                <FieldArray name="founderAllocation">
                  {({ remove, push }) => (
                    <AdminFounderAllocationFields
                      formik={formik}
                      auctionDuration={fromSeconds(auctionDuration)}
                      touched={formik.touched}
                      values={formik.values}
                      errors={formik.errors}
                      removeFounderAddress={remove}
                      addFounderAddress={() =>
                        push({
                          founderAddress: '',
                          allocationPercentage: '',
                          endDate: '',
                        })
                      }
                    />
                  )}
                </FieldArray>
              </Section>
            </Stack>

            <StickySave
              confirmText={`Create proposal for ${changes} ${
                !!changes && changes > 1 ? 'changes' : 'change'
              } to the contract parameters.`}
              disabled={!formik.dirty || !formik.isValid || changes === 0}
              saveButtonText={'Create Proposal'}
              onSave={formik.handleSubmit}
              isSubmitting={formik.isSubmitting}
            />
          </Flex>
        )
      }}
    </Formik>
  )
}
