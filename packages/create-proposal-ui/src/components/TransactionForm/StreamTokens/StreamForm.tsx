import { DatePicker, FIELD_TYPES, SmartInput } from '@buildeross/ui/Fields'
import { StreamGraph } from '@buildeross/ui/Graph'
import { formatExponent } from '@buildeross/utils/sablier/streams'
import { Box, Button, Stack, Text } from '@buildeross/zord'
import { useFormikContext } from 'formik'
import React, { useMemo } from 'react'
import { parseUnits } from 'viem'

import { StreamFormValues, StreamTokensValues } from './StreamTokens.schema'

const SECONDS_PER_DAY = 86400

interface StreamFormProps {
  index: number
  removeStream: () => void
}

export const StreamForm: React.FC<StreamFormProps> = ({ index, removeStream }) => {
  const formik = useFormikContext<StreamTokensValues>()
  const durationType = formik.values.durationType
  const useExponential = formik.values.useExponential || false
  const stream = formik.values.streams[index]
  const decimals = formik.values.tokenMetadata?.decimals ?? 18
  const symbol = formik.values.tokenMetadata?.symbol ?? ''

  // Helper to get error message for a field
  const getFieldError = (fieldName: keyof StreamFormValues): string | undefined => {
    const streamError = formik.errors.streams?.[index]
    if (!streamError || typeof streamError === 'string') return undefined
    const error = (streamError as any)[fieldName]
    return error ? String(error) : undefined
  }

  // Calculate stream times and amount for graph preview
  const streamPreviewData = useMemo(() => {
    if (!stream.amount || stream.amount.trim() === '') return null

    try {
      const depositAmount = parseUnits(stream.amount, decimals)
      if (depositAmount <= 0n) return null

      let startTime: number
      let endTime: number
      let cliffTime = 0

      if (durationType === 'days') {
        if (!stream.durationDays || stream.durationDays <= 0) return null
        const now = Math.floor(Date.now() / 1000)
        startTime = now
        endTime = now + stream.durationDays * SECONDS_PER_DAY
        if (!useExponential && stream.cliffDays && stream.cliffDays > 0) {
          cliffTime = now + stream.cliffDays * SECONDS_PER_DAY
        }
      } else {
        // dates mode
        if (!stream.startDate || !stream.endDate) return null
        startTime = Math.floor(new Date(stream.startDate).getTime() / 1000)
        endTime = Math.floor(new Date(stream.endDate).getTime() / 1000)
        if (endTime <= startTime) return null
        if (!useExponential && stream.cliffDays && stream.cliffDays > 0) {
          cliffTime = startTime + stream.cliffDays * SECONDS_PER_DAY
        }
      }

      // Compute final exponent for preview (invert if checkbox is checked)
      const finalExponent =
        useExponential && formik.values.exponent
          ? formik.values.invertExponent
            ? 1 / formik.values.exponent
            : formik.values.exponent
          : undefined

      return {
        depositAmount,
        decimals,
        symbol,
        startTime,
        endTime,
        cliffTime,
        exponent: finalExponent,
      }
    } catch (error) {
      return null
    }
  }, [
    stream.amount,
    stream.durationDays,
    stream.startDate,
    stream.endDate,
    stream.cliffDays,
    durationType,
    decimals,
    symbol,
    useExponential,
    formik.values.exponent,
    formik.values.invertExponent,
  ])

  return (
    <Stack>
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
            min={1}
            step={1}
            errorMessage={
              formik.touched.streams?.[index]?.durationDays
                ? getFieldError('durationDays')
                : undefined
            }
            helperText="How many days the stream will last from now"
          />

          {!useExponential && (
            <SmartInput
              {...formik.getFieldProps(`streams.${index}.cliffDays`)}
              inputLabel="Cliff Period (optional, in days)"
              id={`streams.${index}.cliffDays`}
              type={FIELD_TYPES.NUMBER}
              placeholder={'0'}
              min={0}
              step={1}
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
          )}
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

          {!useExponential && (
            <SmartInput
              {...formik.getFieldProps(`streams.${index}.cliffDays`)}
              inputLabel="Cliff Period (optional, in days)"
              id={`streams.${index}.cliffDays`}
              type={FIELD_TYPES.NUMBER}
              placeholder={'0'}
              min={0}
              step={1}
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
          )}
        </>
      )}

      {/* Stream Preview Graph */}
      {streamPreviewData && (
        <Box mt="x4" p="x4" borderRadius="curved" backgroundColor="background2">
          <Text variant="label-sm" mb="x2">
            Stream Preview
            {useExponential && formik.values.exponent && (
              <Text as="span" color="text3" ml="x2">
                {formik.values.invertExponent
                  ? `(Exponential Frontloaded, exp: ${formatExponent(1 / formik.values.exponent)})`
                  : `(Exponential Backloaded, exp: ${formatExponent(formik.values.exponent)})`}
              </Text>
            )}
          </Text>
          <Box w="100%" style={{ aspectRatio: '2.27/1' }}>
            <StreamGraph
              depositAmount={streamPreviewData.depositAmount}
              decimals={streamPreviewData.decimals}
              symbol={streamPreviewData.symbol}
              startTime={streamPreviewData.startTime}
              endTime={streamPreviewData.endTime}
              cliffTime={streamPreviewData.cliffTime}
              exponent={streamPreviewData.exponent}
              width={500}
              height={220}
            />
          </Box>
        </Box>
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
