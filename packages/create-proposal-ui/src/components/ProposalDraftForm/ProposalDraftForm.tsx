import { TextInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Stack } from '@buildeross/zord'
import React from 'react'

type ProposalDraftFormProps = {
  title: string
  summary: string
  onTitleChange: (value: string) => void
  onSummaryChange: (value: string) => void
  onTitleBlur?: () => void
  onSummaryBlur?: () => void
  titleError?: string
  summaryError?: string
  disabled?: boolean
}

export const ProposalDraftForm: React.FC<ProposalDraftFormProps> = ({
  title,
  summary,
  onTitleChange,
  onSummaryChange,
  onTitleBlur,
  onSummaryBlur,
  titleError,
  summaryError,
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
    </Stack>
  )
}
