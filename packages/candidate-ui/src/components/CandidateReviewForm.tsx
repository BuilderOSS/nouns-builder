import { useCandidateStore } from '@buildeross/stores'
import { Box, Stack, Text } from '@buildeross/zord'
import React from 'react'

export interface CandidateReviewFormProps {
  onSubmit?: () => Promise<void>
  onBack?: () => void
}

export const CandidateReviewForm: React.FC<CandidateReviewFormProps> = ({
  onSubmit,
  onBack,
}) => {
  const { title, summary, discussionUrl, transactions } = useCandidateStore()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (!onSubmit) return
    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Stack gap="x6">
      <Box>
        <Text fontWeight="label" mb="x2">
          Title
        </Text>
        <Text>{title}</Text>
      </Box>
      <Box>
        <Text fontWeight="label" mb="x2">
          Summary
        </Text>
        <Text>{summary}</Text>
      </Box>
      {discussionUrl && (
        <Box>
          <Text fontWeight="label" mb="x2">
            Discussion
          </Text>
          <Text as="a" href={discussionUrl} target="_blank" rel="noopener noreferrer">
            {discussionUrl}
          </Text>
        </Box>
      )}
      <Box>
        <Text fontWeight="label" mb="x2">
          Transactions
        </Text>
        <Text color="text3">{transactions.length} transaction(s)</Text>
      </Box>
      <Stack direction="horizontal" gap="x4">
        {onBack && <button onClick={onBack}>Back</button>}
        {onSubmit && (
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Candidate'}
          </button>
        )}
      </Stack>
    </Stack>
  )
}
