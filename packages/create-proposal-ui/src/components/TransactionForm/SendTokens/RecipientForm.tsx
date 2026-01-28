import { FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { Button, Stack } from '@buildeross/zord'
import { useFormikContext } from 'formik'
import React from 'react'

import { RecipientFormValues, SendTokensValues } from './SendTokens.schema'

interface RecipientFormProps {
  index: number
  removeRecipient: () => void
}

export const RecipientForm: React.FC<RecipientFormProps> = ({
  index,
  removeRecipient,
}) => {
  const formik = useFormikContext<SendTokensValues>()

  // Helper to get error message for a field
  const getFieldError = (fieldName: keyof RecipientFormValues): string | undefined => {
    const recipientError = formik.errors.recipients?.[index]
    if (!recipientError || typeof recipientError === 'string') return undefined
    const error = (recipientError as any)[fieldName]
    return error ? String(error) : undefined
  }

  return (
    <Stack gap={'x4'}>
      <SmartInput
        type={FIELD_TYPES.TEXT}
        formik={formik}
        {...formik.getFieldProps(`recipients.${index}.recipientAddress`)}
        id={`recipients.${index}.recipientAddress`}
        inputLabel={'Recipient Address'}
        placeholder={'0x... or .eth'}
        isAddress={true}
        errorMessage={
          formik.touched.recipients?.[index]?.recipientAddress
            ? getFieldError('recipientAddress')
            : undefined
        }
        helperText="The wallet address that will receive the tokens"
      />

      <SmartInput
        {...formik.getFieldProps(`recipients.${index}.amount`)}
        inputLabel="Amount"
        id={`recipients.${index}.amount`}
        type={FIELD_TYPES.TEXT}
        placeholder={'100'}
        errorMessage={
          formik.touched.recipients?.[index]?.amount ? getFieldError('amount') : undefined
        }
        helperText="Amount of tokens to send to this recipient"
      />

      {formik.values.recipients.length > 1 && (
        <Button
          variant="ghost"
          borderRadius="curved"
          onClick={removeRecipient}
          style={{ alignSelf: 'flex-start' }}
          icon="cross"
        >
          Remove Recipient
        </Button>
      )}
    </Stack>
  )
}
