import { FIELD_TYPES, SmartInput, TextInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

type ProposalDraftFormProps = {
  title: string
  summary: string
  representedAddress: string
  discussionUrl: string
  representedAddressEnabled: boolean
  onTitleChange: (value: string) => void
  onSummaryChange: (value: string) => void
  onRepresentedAddressChange: (value: string) => void
  onDiscussionUrlChange: (value: string) => void
  onRepresentedAddressEnabledChange: (value: boolean) => void
  onTitleBlur?: () => void
  onSummaryBlur?: () => void
  onRepresentedAddressBlur?: () => void
  onDiscussionUrlBlur?: () => void
  titleError?: string
  summaryError?: string
  representedAddressError?: string
  discussionUrlError?: string
  disabled?: boolean
}

export const ProposalDraftForm: React.FC<ProposalDraftFormProps> = ({
  title,
  summary,
  representedAddress,
  discussionUrl,
  representedAddressEnabled,
  onTitleChange,
  onSummaryChange,
  onRepresentedAddressChange,
  onDiscussionUrlChange,
  onRepresentedAddressEnabledChange,
  onTitleBlur,
  onSummaryBlur,
  onRepresentedAddressBlur,
  onDiscussionUrlBlur,
  titleError,
  summaryError,
  representedAddressError,
  discussionUrlError,
  disabled,
}) => {
  return (
    <Stack width={'100%'}>
      <TextInput
        id={'title'}
        value={title}
        inputLabel={'Title'}
        disabled={disabled}
        onChange={(e) => onTitleChange(e.target.value)}
        onBlur={onTitleBlur ? () => onTitleBlur() : undefined}
        errorMessage={titleError}
      />

      <MarkdownEditor
        value={summary}
        onChange={onSummaryChange}
        onBlur={onSummaryBlur}
        disabled={disabled}
        inputLabel={'Description'}
        errorMessage={summaryError}
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
            checked={representedAddressEnabled}
            disabled={disabled}
            onChange={(event) => onRepresentedAddressEnabledChange(event.target.checked)}
          />
          <Text variant={'paragraph-md'}>
            Are you submitting this proposal on behalf of someone else?
          </Text>
        </label>
      </Box>

      {representedAddressEnabled && (
        <SmartInput
          type={FIELD_TYPES.TEXT}
          id={'representedAddress'}
          value={representedAddress}
          inputLabel={'Represented Address'}
          placeholder={'0x...'}
          onChange={(event) =>
            onRepresentedAddressChange((event.target as HTMLInputElement).value)
          }
          onBlur={onRepresentedAddressBlur ? () => onRepresentedAddressBlur() : undefined}
          disabled={disabled}
          isAddress
          errorMessage={representedAddressError}
        />
      )}

      <TextInput
        id={'discussionUrl'}
        value={discussionUrl}
        inputLabel={'Discussion URL (optional)'}
        disabled={disabled}
        onChange={(event) => onDiscussionUrlChange(event.target.value)}
        onBlur={onDiscussionUrlBlur ? () => onDiscussionUrlBlur() : undefined}
        placeholder={'https://'}
        errorMessage={discussionUrlError}
      />
    </Stack>
  )
}
