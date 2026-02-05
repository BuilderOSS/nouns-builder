import { DatePicker, FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { Button, Stack } from '@buildeross/zord'
import { useFormikContext } from 'formik'
import React from 'react'

import { StreamFormValues, StreamTokensValues } from './StreamTokens.schema'

interface StreamFormProps {
  index: number
  removeStream: () => void
}

export const StreamForm: React.FC<StreamFormProps> = ({ index, removeStream }) => {
  const formik = useFormikContext<StreamTokensValues>()
  const durationType = formik.values.durationType

  // Helper to get error message for a field
  const getFieldError = (fieldName: keyof StreamFormValues): string | undefined => {
    const streamError = formik.errors.streams?.[index]
    if (!streamError || typeof streamError === 'string') return undefined
    const error = (streamError as any)[fieldName]
    return error ? String(error) : undefined
  }

  return (
    <Stack gap={'x4'}>
      <SmartInput
        type={FIELD_TYPES.TEXT}
        formik={formik}
        {...formik.getFieldProps(`streams.${index}.recipientAddress`)}
        id={`streams.${index}.recipientAddress`}
        inputLabel={'Recipient Address'}
        placeholder={'0x...'}
        isAddress={true}
        errorMessage={
          formik.touched.streams?.[index]?.recipientAddress
            ? getFieldError('recipientAddress')
            : undefined
        }
        helperText="The wallet address that will receive the streamed tokens"
      />

      <SmartInput
        {...formik.getFieldProps(`streams.${index}.amount`)}
        inputLabel="Amount"
        id={`streams.${index}.amount`}
        type={FIELD_TYPES.TEXT}
        placeholder={'100'}
        errorMessage={
          formik.touched.streams?.[index]?.amount ? getFieldError('amount') : undefined
        }
        helperText="Amount of tokens to stream to this recipient"
      />

      {durationType === 'days' ? (
        <>
          <SmartInput
            {...formik.getFieldProps(`streams.${index}.durationDays`)}
            inputLabel="Duration (in days)"
            id={`streams.${index}.durationDays`}
            type={FIELD_TYPES.NUMBER}
            placeholder={'30'}
            min={0}
            errorMessage={
              formik.touched.streams?.[index]?.durationDays
                ? getFieldError('durationDays')
                : undefined
            }
            helperText="How many days the stream will last from now"
          />

          <SmartInput
            {...formik.getFieldProps(`streams.${index}.cliffDays`)}
            inputLabel="Cliff Period (in days, optional)"
            id={`streams.${index}.cliffDays`}
            type={FIELD_TYPES.NUMBER}
            placeholder={'0'}
            min={0}
            errorMessage={
              formik.touched.streams?.[index]?.cliffDays
                ? getFieldError('cliffDays')
                : undefined
            }
            helperText="Tokens will start streaming after this many days (0 = immediate)"
            onChange={(e) => {
              formik.handleChange(e)
              formik.setFieldTouched(`streams.${index}.cliffDays`, true, false)
            }}
            onBlur={(e) => {
              formik.handleBlur(e)
              formik.setFieldTouched(`streams.${index}.cliffDays`, true, true)
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.select()
            }}
          />
        </>
      ) : (
        <>
          <DatePicker
            {...formik.getFieldProps(`streams.${index}.startDate`)}
            formik={formik}
            id={`streams.${index}.startDate`}
            inputLabel={'Start Date'}
            placeholder={'yyyy-mm-dd'}
            dateFormat="Y-m-d"
            errorMessage={
              formik.touched.streams?.[index]?.startDate
                ? getFieldError('startDate')
                : undefined
            }
            helperText="When the stream will start"
          />

          <DatePicker
            {...formik.getFieldProps(`streams.${index}.endDate`)}
            formik={formik}
            id={`streams.${index}.endDate`}
            inputLabel={'End Date'}
            placeholder={'yyyy-mm-dd'}
            dateFormat="Y-m-d"
            errorMessage={
              formik.touched.streams?.[index]?.endDate
                ? getFieldError('endDate')
                : undefined
            }
            helperText="When the stream will end"
          />

          <SmartInput
            {...formik.getFieldProps(`streams.${index}.cliffDays`)}
            inputLabel="Cliff Period (in days, optional)"
            id={`streams.${index}.cliffDays`}
            type={FIELD_TYPES.NUMBER}
            placeholder={'0'}
            min={0}
            errorMessage={
              formik.touched.streams?.[index]?.cliffDays
                ? getFieldError('cliffDays')
                : undefined
            }
            helperText="Tokens will start streaming after this many days from start"
            onChange={(e) => {
              formik.handleChange(e)
              formik.setFieldTouched(`streams.${index}.cliffDays`, true, false)
            }}
            onBlur={(e) => {
              formik.handleBlur(e)
              formik.setFieldTouched(`streams.${index}.cliffDays`, true, true)
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.target.select()
            }}
          />
        </>
      )}

      {formik.values.streams.length > 1 && (
        <Button
          variant="ghost"
          borderRadius="curved"
          onClick={removeStream}
          style={{ alignSelf: 'flex-start' }}
          icon="cross"
        >
          Remove Stream
        </Button>
      )}
    </Stack>
  )
}
