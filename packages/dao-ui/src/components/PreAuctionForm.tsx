import { NULL_ADDRESS } from '@buildeross/constants/addresses'
import { auctionAbi } from '@buildeross/sdk/contract'
import { useChainStore, useDaoStore } from '@buildeross/stores'
import { AddressType } from '@buildeross/types'
import {
  DaysHoursMinsSecs,
  FIELD_TYPES,
  SmartInput,
  StickySave,
} from '@buildeross/ui/Fields'
import { getEnsAddress } from '@buildeross/utils/ens'
import {
  compareAndReturn,
  fromSeconds,
  toSeconds,
  unpackOptionalArray,
} from '@buildeross/utils/helpers'
import { Box, Flex, Stack } from '@buildeross/zord'
import { Formik, FormikValues } from 'formik'
import isEqual from 'lodash/isEqual'
import React, { BaseSyntheticEvent } from 'react'
import { formatEther, isAddressEqual, parseEther } from 'viem'
import { useConfig, useReadContracts } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { adminSection } from '../styles/Section.css'
import { Section } from './AdminForm/Section'
import { PreAuctionFormValues, preAuctionValidationSchema } from './PreAuctionForm.schema'

interface PreAuctionFormSettingsProps {
  title?: string
}

export const PreAuctionForm: React.FC<PreAuctionFormSettingsProps> = () => {
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()

  const auctionContractParams = {
    abi: auctionAbi,
    address: addresses.auction as AddressType,
    chainId: chain.id,
  }

  const { data } = useReadContracts({
    allowFailure: true,
    contracts: [
      { ...auctionContractParams, functionName: 'duration' },
      { ...auctionContractParams, functionName: 'reservePrice' },
      { ...auctionContractParams, functionName: 'founderReward' },
    ] as const,
  })

  const [auctionDuration, auctionReservePrice, founderReward] = unpackOptionalArray(
    data,
    3
  )

  const supportsFounderReward = !founderReward?.error

  const [founderRewardRecipient, founderRewardBPS] = supportsFounderReward
    ? unpackOptionalArray(founderReward?.result, 2)
    : []

  const initialValues: PreAuctionFormValues = {
    auctionDuration: fromSeconds(auctionDuration?.result),
    auctionReservePrice: auctionReservePrice?.result
      ? parseFloat(formatEther(auctionReservePrice?.result))
      : 0,
    auctionRewardRecipient:
      founderRewardRecipient && !isAddressEqual(founderRewardRecipient, NULL_ADDRESS)
        ? founderRewardRecipient
        : '',
    auctionRewardPercentage: founderRewardBPS ? founderRewardBPS / 100 : 0,
  }

  const handleUpdateSettings = async (
    values: PreAuctionFormValues,
    formik: FormikValues
  ) => {
    if (!auctionContractParams.address) return
    formik.setSubmitting(true)

    try {
      const newDuration = values.auctionDuration
      if (!isEqual(newDuration, initialValues['auctionDuration'])) {
        const data = await simulateContract(config, {
          ...auctionContractParams,
          address: auctionContractParams.address,
          functionName: 'setDuration',
          args: [BigInt(toSeconds(newDuration))],
        })
        const hash = await writeContract(config, data.request)
        await waitForTransactionReceipt(config, { hash, chainId: chain.id })
      }

      const newReservePrice = values.auctionReservePrice
      if (!isEqual(newReservePrice, initialValues['auctionReservePrice'])) {
        const data = await simulateContract(config, {
          ...auctionContractParams,
          address: auctionContractParams.address,
          functionName: 'setReservePrice',
          args: [parseEther(newReservePrice.toString())],
        })
        const hash = await writeContract(config, data.request)
        await waitForTransactionReceipt(config, { hash, chainId: chain.id })
      }

      if (supportsFounderReward) {
        const newAuctionRewardRecipient = values.auctionRewardRecipient
          ? await getEnsAddress(values.auctionRewardRecipient as AddressType)
          : NULL_ADDRESS

        const initalAuctionRewardRecipient = initialValues['auctionRewardRecipient']
          ? await getEnsAddress(initialValues['auctionRewardRecipient'] as AddressType)
          : NULL_ADDRESS

        const isRewardRecipientEqual = isAddressEqual(
          newAuctionRewardRecipient,
          initalAuctionRewardRecipient
        )

        const newAuctionRewardPercentage = values.auctionRewardPercentage

        const isRewardPercentageEqual = isEqual(
          newAuctionRewardPercentage,
          initialValues['auctionRewardPercentage']
        )

        if (!isRewardRecipientEqual || !isRewardPercentageEqual) {
          const data = await simulateContract(config, {
            ...auctionContractParams,
            address: auctionContractParams.address,
            functionName: 'setFounderReward',
            args: [
              {
                recipient: newAuctionRewardRecipient,
                percentBps: newAuctionRewardPercentage * 100,
              },
            ],
          })
          const hash = await writeContract(config, data.request)
          await waitForTransactionReceipt(config, { hash, chainId: chain.id })
        }
      }
    } finally {
      formik.setSubmitting(false)
    }
  }

  return (
    <Flex direction={'column'} className={adminSection} mx={'auto'}>
      <Flex direction={'column'} w={'100%'}>
        <Formik
          initialValues={initialValues}
          validationSchema={preAuctionValidationSchema}
          onSubmit={handleUpdateSettings}
          enableReinitialize
          validateOnMount
        >
          {(formik) => {
            const changes = compareAndReturn(formik.initialValues, formik.values).length

            return (
              <Flex direction={'column'} w={'100%'}>
                <Stack>
                  <Section title="Auction Settings">
                    <DaysHoursMinsSecs
                      {...formik.getFieldProps('auctionDuration')}
                      inputLabel={'Auction Duration'}
                      formik={formik}
                      id={'auctionDuration'}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      errorMessage={
                        formik.touched['auctionDuration'] &&
                        formik.errors['auctionDuration']
                          ? formik.errors['auctionDuration']
                          : undefined
                      }
                      placeholder={['1', '0', '0', '0']}
                    />

                    <SmartInput
                      {...formik.getFieldProps('auctionReservePrice')}
                      inputLabel={'Auction Reserve Price'}
                      type={FIELD_TYPES.NUMBER}
                      formik={formik}
                      id={'auctionReservePrice'}
                      onChange={({ target }: BaseSyntheticEvent) => {
                        formik.setFieldValue(
                          'auctionReservePrice',
                          parseFloat(target.value)
                        )
                      }}
                      onBlur={formik.handleBlur}
                      helperText={'The starting price of an auction.'}
                      errorMessage={
                        formik.touched['auctionReservePrice'] &&
                        formik.errors['auctionReservePrice']
                          ? formik.errors['auctionReservePrice']
                          : undefined
                      }
                      perma={'ETH'}
                    />
                  </Section>

                  {supportsFounderReward && (
                    <Section
                      title="Auction Rewards"
                      subtitle={
                        <Box color="text3">
                          DAOs can optionally assign Auction Rewards to an address.{' '}
                          <a
                            href="https://docs.zora.co/docs/guides/builder-protocol-rewards"
                            target="_blank"
                            rel="noreferrer noopener"
                          >
                            learn more
                          </a>
                        </Box>
                      }
                    >
                      <SmartInput
                        {...formik.getFieldProps('auctionRewardRecipient')}
                        inputLabel="Auction Reward Recipient"
                        type={FIELD_TYPES.TEXT}
                        id="auctionRewardRecipient"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        errorMessage={formik.errors['auctionRewardRecipient']}
                        placeholder="0x... or .eth"
                        isAddress={true}
                        helperText={'This is the address that receives auction rewards.'}
                      />

                      <SmartInput
                        {...formik.getFieldProps('auctionRewardPercentage')}
                        inputLabel={'Auction Reward Percentage'}
                        type={FIELD_TYPES.NUMBER}
                        formik={formik}
                        id={'auctionRewardPercentage'}
                        onChange={({ target }: BaseSyntheticEvent) => {
                          formik.setFieldValue(
                            'auctionRewardPercentage',
                            parseFloat(target.value)
                          )
                        }}
                        onBlur={formik.handleBlur}
                        errorMessage={formik.errors['auctionRewardPercentage']}
                        perma={'%'}
                        step={0.1}
                        helperText={
                          'This is the percentage of final auction bids sent to the Auction Reward Recipient.'
                        }
                      />
                    </Section>
                  )}
                </Stack>

                <StickySave
                  confirmText={`I confirm that I want to change ${changes} ${
                    !!changes && changes > 1 ? 'parameters' : 'parameter'
                  }, and understand that there will be ${changes} ${
                    !!changes && changes > 1 ? 'transactions' : 'transaction'
                  } I need to sign and pay gas for.`}
                  disabled={!formik.dirty || changes === 0}
                  isSubmitting={formik.isSubmitting}
                  saveButtonText={'Save Changes'}
                  onSave={formik.handleSubmit}
                  chainId={chain.id}
                />
              </Flex>
            )
          }}
        </Formik>
      </Flex>
    </Flex>
  )
}
