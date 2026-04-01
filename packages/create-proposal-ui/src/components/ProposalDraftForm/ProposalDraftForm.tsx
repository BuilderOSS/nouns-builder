import { FIELD_TYPES, SmartInput, TextInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Box, Stack, Text } from '@buildeross/zord'
import { FormikProps } from 'formik'
import React from 'react'

export type ProposalDraftFormValues = {
  title?: string
  summary?: string
  representedAddress?: string
  discussionUrl?: string
  representedAddressEnabled: boolean
}

type ProposalDraftFormProps<T extends ProposalDraftFormValues> = {
  formik: FormikProps<T>
  onRepresentedAddressBlur?: () => Promise<void> | void
  onRepresentedAddressEnabledChange?: (value: boolean) => void
  onTitleChange?: (value: string) => void
  onSummaryChange?: (value: string) => void
  onDiscussionUrlChange?: (value: string) => void
  disabled?: boolean
}

const getFieldError = (
  error: unknown,
  touched: boolean | undefined
): string | undefined => {
  if (!touched || typeof error !== 'string') return undefined
  return error
}

export const ProposalDraftForm = <T extends ProposalDraftFormValues>({
  formik,
  onRepresentedAddressEnabledChange,
  onTitleChange,
  onSummaryChange,
  onDiscussionUrlChange,
  onRepresentedAddressBlur,
  disabled,
}: ProposalDraftFormProps<T>) => {
  return (
    <Stack width={'100%'}>
      <TextInput
        id={'title'}
        value={formik.values.title || ''}
        inputLabel={'Title'}
        disabled={disabled}
        onChange={(event) => {
          formik.handleChange(event)
          onTitleChange?.(event.target.value)
        }}
        onBlur={formik.handleBlur}
        errorMessage={getFieldError(formik.errors.title, Boolean(formik.touched.title))}
      />

      <MarkdownEditor
        value={formik.values.summary || ''}
        onChange={(value) => {
          void formik.setFieldValue('summary', value)
          onSummaryChange?.(value)
        }}
        onBlur={() => {
          void formik.setFieldTouched('summary', true)
        }}
        disabled={disabled}
        inputLabel={'Description'}
        errorMessage={getFieldError(
          formik.errors.summary,
          Boolean(formik.touched.summary)
        )}
      />

      <Box mb={'x6'}>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: disabled ? 'default' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={!!formik.values.representedAddressEnabled}
            disabled={disabled}
            onChange={(event) => {
              void formik.setFieldValue('representedAddressEnabled', event.target.checked)
              onRepresentedAddressEnabledChange?.(event.target.checked)
            }}
          />
          <Text variant={'paragraph-md'}>
            Are you submitting this proposal on behalf of someone else?
          </Text>
        </label>
      </Box>

      {formik.values.representedAddressEnabled && (
        <SmartInput
          type={FIELD_TYPES.TEXT}
          formik={formik}
          {...formik.getFieldProps('representedAddress')}
          id={'representedAddress'}
          inputLabel={'Represented Address'}
          placeholder={'0x... or ENS name'}
          onBlur={async (event) => {
            formik.handleBlur(event)
            await onRepresentedAddressBlur?.()
          }}
          disabled={disabled}
          isAddress
          helperText={
            'Address of the person or entity you are representing in this proposal.'
          }
          errorMessage={getFieldError(
            formik.errors.representedAddress,
            Boolean(formik.touched.representedAddress)
          )}
        />
      )}

      <TextInput
        id={'discussionUrl'}
        value={formik.values.discussionUrl || ''}
        inputLabel={'Discussion URL (optional)'}
        disabled={disabled}
        onChange={(event) => {
          formik.handleChange(event)
          onDiscussionUrlChange?.(event.target.value)
        }}
        onBlur={formik.handleBlur}
        placeholder={'https://'}
        helperText={
          'Link to a proposal discussion thread (forum, Farcaster, etc). Please do not use IPFS URLs.'
        }
        errorMessage={getFieldError(
          formik.errors.discussionUrl,
          Boolean(formik.touched.discussionUrl)
        )}
      />
    </Stack>
  )
}
