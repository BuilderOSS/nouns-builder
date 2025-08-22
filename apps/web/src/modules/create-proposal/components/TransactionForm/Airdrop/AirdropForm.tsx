import { FIELD_TYPES, SmartInput } from '@buildeross/ui'
import { Box, Button, Flex } from '@buildeross/zord'
import type { FormikHelpers } from 'formik'
import { Form, Formik } from 'formik'
import type { FC } from 'react'
import { useCallback } from 'react'
import Input from 'src/components/Input/Input'

import airdropFormSchema, { AirdropFormValues } from './AirdropForm.schema'

export interface AirdropFormProps {
  onSubmit?: (
    values: AirdropFormValues,
    actions: FormikHelpers<AirdropFormValues>
  ) => void
  disabled?: boolean
}

const AirdropForm: FC<AirdropFormProps> = ({ onSubmit, disabled }) => {
  const initialValues: AirdropFormValues = {
    recipientAddress: '',
    amount: 0,
  }

  const handleSubmit = useCallback(
    (values: AirdropFormValues, actions: FormikHelpers<AirdropFormValues>) => {
      onSubmit?.(values, actions)
    },
    [onSubmit]
  )

  return (
    <Box w={'100%'}>
      <Formik
        initialValues={initialValues}
        validationSchema={airdropFormSchema}
        onSubmit={handleSubmit}
        validateOnBlur
        validateOnMount={false}
        validateOnChange={false}
      >
        {(formik) => (
          <Box
            data-testid="airdrop-form"
            as={'fieldset'}
            disabled={formik.isValidating || disabled}
            style={{ outline: 0, border: 0, padding: 0, margin: 0 }}
          >
            <Flex as={Form} direction={'column'}>
              <SmartInput
                type={FIELD_TYPES.TEXT}
                formik={formik}
                {...formik.getFieldProps('recipientAddress')}
                id="recipientAddress"
                inputLabel={'Recipient Wallet Address/ENS'}
                placeholder={'0x...'}
                isAddress={true}
                errorMessage={
                  formik.touched.recipientAddress && formik.errors.recipientAddress
                    ? formik.errors.recipientAddress
                    : undefined
                }
              />

              <Box mt={'x5'}>
                <Input
                  name={'amount'}
                  label={'Amount'}
                  secondaryLabel={'Tokens'}
                  autoComplete={'off'}
                  type={'number'}
                  placeholder={0}
                  min={0}
                  error={
                    formik.touched.amount && formik.errors.amount
                      ? formik.errors.amount
                      : undefined
                  }
                />
              </Box>

              <Button
                mt={'x9'}
                variant={'outline'}
                borderRadius={'curved'}
                type="submit"
                disabled={!formik.isValid || disabled}
              >
                Add Transaction to Queue
              </Button>
            </Flex>
          </Box>
        )}
      </Formik>
    </Box>
  )
}

export default AirdropForm
