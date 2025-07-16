import { Box, Button, Flex } from '@buildeross/zord'
import { Field, Formik, Form as FormikForm } from 'formik'
import React, { useState } from 'react'
import { Address } from 'viem'
import { useConfig } from 'wagmi'
import { simulateContract, waitForTransactionReceipt, writeContract } from 'wagmi/actions'

import { ContractButton } from 'src/components/ContractButton'
import SmartInput from 'src/components/Fields/SmartInput'
import { Icon } from 'src/components/Icon'
import { tokenAbi } from 'src/data/contract/abis'
import { useChainStore } from 'src/stores/useChainStore'
import { proposalFormTitle } from 'src/styles/Proposals.css'
import { getEnsAddress } from 'src/utils/ens'

import { useDaoStore } from '../../stores'
import { delegateValidationSchema } from './DelegateForm.schema'

interface AddressFormProps {
  address?: string
}

interface DelegateFormProps {
  handleBack: () => void
  handleUpdate: (address: string) => void
}

export const DelegateForm = ({ handleBack, handleUpdate }: DelegateFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { addresses } = useDaoStore()
  const chain = useChainStore((x) => x.chain)
  const config = useConfig()

  const submitCallback = async (values: AddressFormProps) => {
    if (!values.address || !addresses.token) return

    setIsLoading(true)
    try {
      const delegate = (await getEnsAddress(values.address)) as Address
      const data = await simulateContract(config, {
        abi: tokenAbi,
        address: addresses.token,
        chainId: chain.id,
        functionName: 'delegate',
        args: [delegate],
      })
      const hash = await writeContract(config, data.request)
      await waitForTransactionReceipt(config, { hash, chainId: chain.id })

      handleUpdate(values.address)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Flex direction={'column'} width={'100%'}>
      <Box className={proposalFormTitle} fontSize={28} mb={'x4'}>
        Update delegate
      </Box>

      <Box mb={'x8'} color="text3">
        Enter the ethereum address or ENS name of the account you would like to delegate
        your votes to
      </Box>

      <Formik
        initialValues={{ address: '' }}
        onSubmit={submitCallback}
        validationSchema={delegateValidationSchema}
      >
        {({ isValid, dirty, values }) => (
          <FormikForm>
            <Field name="address">
              {({ field, form, meta }: any) => (
                <SmartInput
                  {...field}
                  inputLabel="New Delegate"
                  id="address"
                  ensIsValid={form.dirty && !meta.errors}
                  placeholder="0x... or .eth"
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  errorMessage={meta.error}
                  isAddress={true}
                />
              )}
            </Field>

            {isLoading ? (
              <Flex>
                <Button width={'100%'} disabled size="lg">
                  Updating delegate...
                </Button>
              </Flex>
            ) : (
              <Flex>
                <Button variant="secondary" onClick={handleBack} size="lg">
                  <Icon id="arrowLeft" />
                </Button>
                <ContractButton
                  ml="x4"
                  handleClick={() => {
                    submitCallback(values)
                  }}
                  style={{ flex: 'auto' }}
                  disabled={!dirty || !isValid}
                  size="lg"
                >
                  Update delegate
                </ContractButton>
              </Flex>
            )}
          </FormikForm>
        )}
      </Formik>
    </Flex>
  )
}
