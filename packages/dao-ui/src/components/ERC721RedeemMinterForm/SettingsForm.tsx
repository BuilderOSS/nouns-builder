import { erc721RedeemMinterAbi } from '@buildeross/sdk/contract'
import { AddressType, Chain } from '@buildeross/types'
import { ContractButton } from '@buildeross/ui'
import { DatePicker, FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { compareAndReturn, formatDate } from '@buildeross/utils/helpers'
import { Button, Flex, Stack } from '@buildeross/zord'
import { Formik, FormikValues } from 'formik'
import React from 'react'
import { parseEther } from 'viem'
import { useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import {
  ERC721RedeemMinterFormValues,
  erc721RedeemMinterValidationSchema,
} from './ERC721RedeemMinterForm.schema'

interface SettingsFormProps {
  chain: Chain
  minterAddress: AddressType
  tokenAddress: AddressType
  initialValues: ERC721RedeemMinterFormValues
  onSuccess: () => void
  onCancel?: () => void
}

export const SettingsForm: React.FC<SettingsFormProps> = ({
  chain,
  minterAddress,
  tokenAddress,
  initialValues,
  onSuccess,
  onCancel,
}) => {
  const config = useConfig()

  const handleSubmit = async (
    values: ERC721RedeemMinterFormValues,
    formik: FormikValues
  ) => {
    formik.setSubmitting(true)

    try {
      const mintStartTimestamp = BigInt(
        Math.floor(new Date(values.mintStart).getTime() / 1000)
      )
      const mintEndTimestamp = BigInt(
        Math.floor(new Date(values.mintEnd).getTime() / 1000)
      )
      const pricePerTokenWei = parseEther(values.pricePerToken.toString())

      const data = await simulateContract(config, {
        abi: erc721RedeemMinterAbi,
        address: minterAddress,
        functionName: 'setMintSettings',
        args: [
          tokenAddress,
          {
            mintStart: mintStartTimestamp,
            mintEnd: mintEndTimestamp,
            pricePerToken: pricePerTokenWei,
            redeemToken: values.redeemToken as AddressType,
          },
        ],
        chainId: chain.id,
      })

      const hash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, { hash, chainId: chain.id })

      onSuccess()
    } catch (error) {
      console.error('Failed to update settings:', error)
    } finally {
      formik.setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={{
        ...initialValues,
        mintStart: formatDate(new Date(initialValues.mintStart)),
        mintEnd: formatDate(new Date(initialValues.mintEnd)),
      }}
      validationSchema={erc721RedeemMinterValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
      validateOnMount
    >
      {(formik) => {
        const changes = compareAndReturn(formik.initialValues, formik.values).length

        return (
          <Flex direction="column" w="100%">
            <Stack gap="x4">
              <DatePicker
                value={formik.values.mintStart}
                formik={formik}
                id={`mintStart`}
                inputLabel={'Mint Start Date'}
                helperText={'When minting will begin'}
                placeholder={'yyyy-mm-dd'}
                dateFormat="Y-m-d"
                errorMessage={
                  formik.touched?.mintStart
                    ? (formik.errors?.mintStart as string | undefined)
                    : undefined
                }
              />
              <DatePicker
                {...formik.getFieldProps(`mintEnd`)}
                formik={formik}
                id={`mintEnd`}
                inputLabel={'Mint End Date'}
                helperText={'When minting will end'}
                placeholder={'yyyy-mm-dd'}
                dateFormat="Y-m-d"
                errorMessage={
                  formik.touched?.mintEnd
                    ? (formik.errors?.mintEnd as string | undefined)
                    : undefined
                }
              />

              <SmartInput
                inputLabel="Price Per Token (ETH)"
                id="pricePerToken"
                type={FIELD_TYPES.NUMBER}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.pricePerToken}
                formik={formik}
                placeholder="0.01"
                helperText="Price in ETH for each token to be minted"
              />

              <SmartInput
                inputLabel="Redeem Token Address"
                id="redeemToken"
                type={FIELD_TYPES.TEXT}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.redeemToken}
                formik={formik}
                placeholder="0x..."
                helperText="Address of the ERC721 token that can be redeemed to mint"
              />
            </Stack>

            <Flex gap="x3" mt="x6">
              {onCancel && (
                <Button
                  onClick={onCancel}
                  disabled={formik.isSubmitting}
                  variant="secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
              )}
              <ContractButton
                handleClick={formik.handleSubmit}
                disabled={!formik.dirty && changes === 0}
                loading={formik.isSubmitting}
                chainId={chain.id}
                style={{
                  flex: onCancel ? 1 : undefined,
                  width: onCancel ? undefined : '100%',
                }}
              >
                Save Settings
              </ContractButton>
            </Flex>
          </Flex>
        )
      }}
    </Formik>
  )
}
