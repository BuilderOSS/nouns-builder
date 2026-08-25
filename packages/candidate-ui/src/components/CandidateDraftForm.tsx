import { useCandidateStore } from '@buildeross/stores'
import { TextInput } from '@buildeross/ui'
import { MarkdownEditor } from '@buildeross/ui/MarkdownEditor'
import { Box, Stack } from '@buildeross/zord'
import React from 'react'

export interface CandidateDraftFormProps {
  onNext?: () => void
}

export const CandidateDraftForm: React.FC<CandidateDraftFormProps> = () => {
  const { title, summary, discussionUrl, setTitle, setSummary, setDiscussionUrl } =
    useCandidateStore()

  return (
    <Stack width="100%">
      <TextInput
        id="candidate-title"
        value={title || ''}
        inputLabel="Title"
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter candidate title"
        helperText="A clear, descriptive title for your proposal candidate"
      />

      <Box mt="x6">
        <MarkdownEditor
          value={summary || ''}
          onChange={(value) => setSummary(value)}
          inputLabel="Description"
        />
      </Box>

      <Box mt="x6">
        <TextInput
          id="candidate-discussion-url"
          value={discussionUrl || ''}
          inputLabel="Discussion URL (optional)"
          onChange={(e) => setDiscussionUrl(e.target.value)}
          placeholder="https://..."
          helperText="Link to forum discussion, Discord thread, or other relevant discussion"
        />
      </Box>
    </Stack>
  )
}
