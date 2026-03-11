import { TextInput } from '@buildeross/ui/Fields'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Stack } from '@buildeross/zord'
import React from 'react'

type ProposalDraftFormProps = {
  title: string
  summary: string
  onTitleChange: (value: string) => void
  onSummaryChange: (value: string) => void
  titleError?: string
  summaryError?: string
  disabled?: boolean
}

export const ProposalDraftForm: React.FC<ProposalDraftFormProps> = ({
  title,
  summary,
  onTitleChange,
  onSummaryChange,
  titleError,
  summaryError,
  disabled,
}) => {
  const [titleTouched, setTitleTouched] = React.useState(false)
  const [summaryTouched, setSummaryTouched] = React.useState(false)

  return (
    <Stack width={'100%'}>
      <TextInput
        id={'title'}
        value={title}
        inputLabel={'Title'}
        disabled={disabled}
        onChange={(e) => {
          if (!titleTouched) {
            setTitleTouched(true)
          }
          onTitleChange(e.target.value)
        }}
        errorMessage={titleTouched ? titleError : undefined}
      />

      <MarkdownEditor
        value={summary}
        onChange={(value) => {
          if (!summaryTouched) {
            setSummaryTouched(true)
          }
          onSummaryChange(value)
        }}
        disabled={disabled}
        inputLabel={'Description'}
        errorMessage={summaryTouched ? summaryError : undefined}
      />
    </Stack>
  )
}
