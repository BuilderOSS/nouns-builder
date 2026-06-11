import { useCandidateStore } from '@buildeross/stores'
import { TextArea, TextInput } from '@buildeross/ui'
import { Stack } from '@buildeross/zord'
import React from 'react'

export interface CandidateDraftFormProps {
  onNext?: () => void
}

export const CandidateDraftForm: React.FC<CandidateDraftFormProps> = () => {
  const { title, summary, discussionUrl, setTitle, setSummary, setDiscussionUrl } =
    useCandidateStore()

  return (
    <Stack gap="x6">
      <TextInput
        id="candidate-title"
        value={title || ''}
        inputLabel="Title"
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter candidate title"
        helperText="A clear, descriptive title for your proposal candidate"
      />

      <TextArea
        id="candidate-summary"
        value={summary || ''}
        inputLabel="Summary"
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setSummary(e.target.value)
        }
        placeholder="Describe your proposal candidate..."
        rows={6}
        helperText="Explain what your proposal will do and why it's important"
      />

      <TextInput
        id="candidate-discussion-url"
        value={discussionUrl || ''}
        inputLabel="Discussion URL (Optional)"
        onChange={(e) => setDiscussionUrl(e.target.value)}
        placeholder="https://..."
        helperText="Link to forum discussion, Discord thread, or other relevant discussion"
      />
    </Stack>
  )
}
